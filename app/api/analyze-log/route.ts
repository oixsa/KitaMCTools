export const runtime = 'nodejs';

// Configuration comes from environment variables so the owner can point the
// tool at ANY ChatGPT-compatible (OpenAI-compatible) endpoint: OpenRouter,
// LM Studio, Ollama (openai compat), Together, DeepSeek, vLLM, etc.
// All three are required; see .env.example.
const MAX_LOG_CHARS = 100_000;
const MAX_TOKENS = 16_000;

// Simple per-IP rate limit: max 6 AI analyses per 10 minutes per IP.
// In-memory; per server instance. Enough to stop casual balance-draining abuse.
const RATE_LIMIT_MAX = 6;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_LIMIT_MAX) {
    const oldest = Math.min(...hits);
    return { allowed: false, retryAfterSec: Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000) };
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  // Opportunistic cleanup so the map cannot grow unbounded.
  if (rateBuckets.size > 10_000) {
    for (const [key, times] of rateBuckets) {
      if (times.every((t) => t <= cutoff)) rateBuckets.delete(key);
    }
  }
  return { allowed: true, retryAfterSec: 0 };
}

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : 'unknown';
}

interface AiAnalysis {
  rootCause: string;
  explanation: string;
  fixes: string[];
  confidence: 'high' | 'medium' | 'low';
  relatedErrors: string[];
}

interface RuleFindingSummary {
  id: string;
  name: string;
  severity: string;
  matchedLines?: string[];
}

const SYSTEM_PROMPT = `You are a Minecraft crash log expert. You receive a Minecraft crash log (or latest.log) plus a summary of patterns an offline rules engine already matched. Analyze the log and respond ONLY with valid JSON, no markdown, no commentary, matching exactly this shape:
{"rootCause": string, "explanation": string, "fixes": string[], "confidence": "high"|"medium"|"low", "relatedErrors": string[]}
Rules for the content:
- rootCause: one short sentence naming what actually caused the crash.
- explanation: simple, non-technical language a 12-year-old player can follow. Avoid jargon; when you must use a technical term, explain it in plain words.
- fixes: an array of 2 to 6 concrete numbered-style steps (plain strings, no numbering prefix needed). Each step tells the player exactly what to do, naming files, folders, or launcher settings.
- confidence: how sure you are that the root cause is correct.
- relatedErrors: short strings naming the key error classes seen in the log.
Respond in English only. If the log is incomplete or the cause is unclear, set confidence to "low" and say what extra information would help.`;

function getConfig() {
  const baseUrl = process.env.AI_BASE_URL?.replace(/\/+$/, '');
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  return { baseUrl, apiKey, model };
}

// Abuse guard: this endpoint exists to analyze Minecraft logs, not to serve as
// a general chatbot. The model call costs the owner real money, so anything
// that does not look like a log is rejected before it reaches the provider.
const LOG_MARKERS: RegExp[] = [
  /java\.(lang|util|net|io)\./, // Java stack frames and classes
  /(?:\b|\s)(?:ERROR|FATAL|Exception|Caused by)\b/, // log levels and exceptions
  /\b(minecraft|mc|forge|fabric|neoform|quilt|modloader)\b/i, // ecosystem terms
  /\b20\d{2}[-/]\d{2}[-/]\d{2}[T\s]\d{2}:\d{2}/, // ISO-ish timestamps
  /\[\d{2}:\d{2}:\d{2}\]/, // [HH:MM:SS] bracket timestamps
  /\bat\s+[\w$.]+\.(\w+)\(/, // "at com.example...(" stack lines
  /\b(mixin|mod|crash|kotlin|gradle|opengl|glfw|lwjgl|entrypoint|registry)\b/i,
];

function looksLikeLog(text: string): boolean {
  const sample = text.slice(0, 20_000);
  const hits = LOG_MARKERS.filter((r) => r.test(sample)).length;
  return hits >= 2;
}

function truncateMiddle(log: string): { log: string; truncated: boolean } {
  if (log.length <= MAX_LOG_CHARS) return { log, truncated: false };
  const half = Math.floor(MAX_LOG_CHARS / 2);
  // Keep head and tail: crash causes live at the start of the stack trace and the summary at the end.
  const kept = `${log.slice(0, half)}\n\n[... ${log.length - MAX_LOG_CHARS} characters removed by the analyzer ...]\n\n${log.slice(-half)}`;
  return { log: kept, truncated: true };
}

function extractJson(raw: string): unknown {
  let text = raw.trim();
  // Strip markdown code fences if the model wrapped the JSON.
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) text = fence[1].trim();
  // Fall back to the first balanced JSON object in the output.
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('no JSON object found');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function validateAnalysis(data: unknown): AiAnalysis {
  if (typeof data !== 'object' || data === null) throw new Error('not an object');
  const obj = data as Record<string, unknown>;
  if (typeof obj.rootCause !== 'string' || obj.rootCause.length === 0) throw new Error('rootCause missing');
  if (typeof obj.explanation !== 'string' || obj.explanation.length === 0) throw new Error('explanation missing');
  if (!Array.isArray(obj.fixes) || obj.fixes.some((f) => typeof f !== 'string')) throw new Error('fixes invalid');
  const confidence = obj.confidence;
  if (confidence !== 'high' && confidence !== 'medium' && confidence !== 'low') throw new Error('confidence invalid');
  const relatedErrors = Array.isArray(obj.relatedErrors)
    ? obj.relatedErrors.filter((e): e is string => typeof e === 'string')
    : [];
  return {
    rootCause: obj.rootCause,
    explanation: obj.explanation,
    fixes: obj.fixes as string[],
    confidence,
    relatedErrors,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const { log, ruleFindings } = body as { log?: unknown; ruleFindings?: unknown };

  if (typeof log !== 'string' || log.trim().length === 0) {
    return Response.json({ error: 'A non-empty log string is required.' }, { status: 400 });
  }

  // Reject conversational / non-log input before spending provider tokens.
  if (!looksLikeLog(log)) {
    return Response.json(
      { error: 'This endpoint only analyzes Minecraft logs and crash reports. Paste a log file such as latest.log or a crash report.' },
      { status: 422 }
    );
  }

  const { baseUrl, apiKey, model } = getConfig();
  if (!baseUrl || !apiKey || !model) {
    return Response.json(
      { error: 'AI analysis unavailable: server AI configuration incomplete. Set AI_BASE_URL, AI_API_KEY and AI_MODEL.' },
      { status: 503 }
    );
  }

  const rl = checkRateLimit(clientIp(request));
  if (!rl.allowed) {
    return Response.json(
      { error: `Too many analyses. Try again in about ${Math.ceil(rl.retryAfterSec / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  const { log: keptLog, truncated } = truncateMiddle(log);

  const summaryLines =
    Array.isArray(ruleFindings)
      ? (ruleFindings as RuleFindingSummary[])
          .filter((f) => typeof f?.id === 'string' && typeof f?.name === 'string')
          .map((f) => `- ${f.name} [${f.severity}]${Array.isArray(f.matchedLines) && f.matchedLines.length ? `; sample: ${f.matchedLines[0]}` : ''}`)
          .join('\n')
      : '';

  const userMessage = `Local rules engine matched these patterns:\n${summaryLines || '(no patterns matched)'}\n${truncated ? 'Note: the log was truncated in the middle for length.\n' : ''}Log:\n${keptLog}`;

  // OpenAI-compatible chat completion call via plain fetch, so any compatible
  // provider works without an SDK. Never logs or echoes the key.
  let rawText: string;
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      // Consume the body but discard contents: provider errors may echo the key in some setups.
      await response.text().catch(() => '');
      return Response.json({ error: 'The AI provider rejected the request. Check AI_BASE_URL, AI_API_KEY and AI_MODEL.' }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    rawText = data?.choices?.[0]?.message?.content ?? '';
    if (!rawText) throw new Error('empty completion');
  } catch {
    // Never echo fetch internals or the key.
    return Response.json({ error: 'AI analysis failed while contacting the model. Please try again.' }, { status: 502 });
  }

  try {
    const analysis = validateAnalysis(extractJson(rawText));
    return Response.json({ analysis, logTruncated: truncated });
  } catch {
    return Response.json(
      { error: 'The model returned an unexpected response format. Please try again.' },
      { status: 502 }
    );
  }
}
