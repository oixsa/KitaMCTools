"use client";

import { useRef, useState } from 'react';
import { ToolHeader } from '@/app/components/ToolHeader';
import { Toast } from '@/app/components/Toast';
import { useClipboard } from '@/app/hooks/useClipboard';
import { analyzeLog, RuleFinding } from '@/app/lib/crash-patterns';

interface AiAnalysis {
  rootCause: string;
  explanation: string;
  fixes: string[];
  confidence: 'high' | 'medium' | 'low';
  relatedErrors: string[];
}

type AiState = 'idle' | 'loading' | 'done' | 'error';

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB client-side guard so we never read a huge file into memory

const SEVERITY_STYLES: Record<RuleFinding['rule']['severity'], { border: string; bg: string; text: string; icon: string; label: string }> = {
  error: {
    border: 'border-[var(--md-sys-color-error)]/50',
    bg: 'bg-[var(--md-sys-color-surface-container-lowest)]',
    text: 'text-[var(--md-sys-color-error)]',
    icon: 'error',
    label: 'Error',
  },
  warning: {
    border: 'border-[var(--md-sys-color-tertiary)]/50',
    bg: 'bg-[var(--md-sys-color-surface-container-lowest)]',
    text: 'text-[var(--md-sys-color-tertiary)]',
    icon: 'warning',
    label: 'Warning',
  },
  info: {
    border: 'border-[var(--md-sys-color-primary)]/40',
    bg: 'bg-[var(--md-sys-color-surface-container-lowest)]',
    text: 'text-[var(--md-sys-color-primary)]',
    icon: 'info',
    label: 'Context',
  },
};

const CONFIDENCE_LABEL: Record<AiAnalysis['confidence'], string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

export default function LogAnalyzerPage() {
  const [log, setLog] = useState('');
  const [findings, setFindings] = useState<RuleFinding[] | null>(null);
  const [aiState, setAiState] = useState<AiState>('idle');
  const [aiResult, setAiResult] = useState<AiAnalysis | null>(null);
  const [aiError, setAiError] = useState('');
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copy, toastMessage, showToast } = useClipboard();

  const hasLog = log.trim().length > 0;

  const runPatternAnalysis = () => {
    if (!hasLog) {
      showToast('Paste or upload a log first');
      return;
    }
    setFindings(analyzeLog(log));
    setAiResult(null);
    setAiState('idle');
    showToast('Pattern analysis complete');
  };

  const runDeepAnalysis = async () => {
    if (!hasLog) return;
    setAiState('loading');
    setAiError('');
    try {
      const ruleFindings = (findings ?? analyzeLog(log)).map((f) => ({
        id: f.rule.id,
        name: f.rule.name,
        severity: f.rule.severity,
        matchedLines: f.matchedLines,
      }));
      const res = await fetch('/api/analyze-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log, ruleFindings }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.analysis) {
        setAiError(data?.error || `AI analysis failed (HTTP ${res.status}).`);
        setAiState('error');
        return;
      }
      setAiResult(data.analysis as AiAnalysis);
      setAiState('done');
    } catch {
      setAiError('Could not reach the analysis server. Check your connection and try again.');
      setAiState('error');
    }
  };

  const handleFile = (file: File | undefined) => {
    setFileError('');
    if (!file) return;
    if (!/\.(log|txt)$/i.test(file.name)) {
      setFileError('Only .log and .txt files are supported.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('File is larger than 2 MB. Copy and paste the important parts instead.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLog(typeof reader.result === 'string' ? reader.result : '');
      setFileName(file.name);
      showToast(`Loaded ${file.name}`);
    };
    reader.onerror = () => setFileError('Could not read the file. Try again.');
    reader.readAsText(file);
  };

  const clearAll = () => {
    setLog('');
    setFindings(null);
    setAiResult(null);
    setAiState('idle');
    setAiError('');
    setFileError('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildReport = () => {
    const lines: string[] = ['AI Crash Log Analyzer report', ''];
    if (findings) {
      lines.push('Pattern matches:');
      findings.forEach((f, i) => {
        lines.push(`${i + 1}. [${f.rule.severity.toUpperCase()}] ${f.rule.name}`);
        lines.push(`   Cause: ${f.rule.cause}`);
        lines.push(`   Fix: ${f.rule.fix}`);
        if (f.matchedLines[0]) lines.push(`   Matched: ${f.matchedLines[0]}`);
      });
    }
    if (aiResult) {
      lines.push('', 'AI deep analysis:');
      lines.push(`Root cause: ${aiResult.rootCause}`);
      lines.push(`Explanation: ${aiResult.explanation}`);
      lines.push('Fixes:');
      aiResult.fixes.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
      lines.push(`Confidence: ${CONFIDENCE_LABEL[aiResult.confidence]}`);
    }
    return lines.join('\n');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <Toast message={toastMessage} />

      <ToolHeader
        title="AI Crash Log Analyzer"
        description="Paste or upload a Minecraft crash report or latest.log. Instant local pattern matching explains the cause and gives plain-language fixes, with an optional AI deep analysis for tricky logs."
        badge="Server & Creator"
        icon="troubleshoot"
      />

      {/* ============================================================ */}
      {/* INPUT SECTION                                                 */}
      {/* ============================================================ */}
      <div className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 sm:p-6 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-headline font-bold text-base text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-[20px]">description</span>
            Your log
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-primary)] transition-colors">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              {fileName ? fileName : 'Upload .log / .txt'}
              <input
                ref={fileInputRef}
                type="file"
                accept=".log,.txt"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
                aria-label="Upload log file"
              />
            </label>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-error)] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          className="w-full min-h-[220px] sm:min-h-[280px] p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] focus:outline-none ring-0 focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/20 text-[var(--md-sys-color-on-surface)] resize-y"
          placeholder="Paste your crash report or latest.log here..."
          aria-label="Log content"
        />

        {fileError && (
          <p role="alert" className="mt-2 text-xs font-medium text-[var(--md-sys-color-error)] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">error</span>
            {fileError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            type="button"
            onClick={runPatternAnalysis}
            className="px-5 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">troubleshoot</span>
            Analyze log
          </button>
          <button
            type="button"
            onClick={runDeepAnalysis}
            disabled={!hasLog || aiState === 'loading'}
            className="px-5 py-2.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-sm font-bold hover:border-[var(--md-sys-color-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            {aiState === 'loading' ? 'Analyzing with AI...' : 'Run AI deep analysis'}
          </button>
        </div>

        {/* Where to find logs: shown while the log is empty */}
        {!hasLog && (
          <div className="mt-4 p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="font-bold text-[var(--md-sys-color-on-surface)] block mb-1">Where to find your log</span>
            Windows: press Win+R, type <code className="font-mono-meta">%appdata%/.minecraft/logs/</code> and open
            <code className="font-mono-meta"> latest.log</code>. Crash reports live in
            <code className="font-mono-meta"> crash-reports/</code> next to it. macOS: <code className="font-mono-meta">~/Library/Application Support/minecraft/logs/</code>.
            Linux: <code className="font-mono-meta">~/.minecraft/logs/</code>. Servers: the <code className="font-mono-meta">logs/</code> folder next to the server jar.
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* RESULTS SECTION                                               */}
      {/* ============================================================ */}
      <div className="space-y-8">
        {/* Layer 1: pattern findings */}
        {findings && (
          <section aria-label="Pattern analysis results">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline font-bold text-lg text-[var(--md-sys-color-on-surface)]">
                Pattern matches
                <span className="ml-2 text-sm font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                  {findings.length} {findings.length === 1 ? 'finding' : 'findings'}
                </span>
              </h2>
              {findings.length > 0 && (
                <button
                  type="button"
                  onClick={() => copy(buildReport(), 'Copied report to clipboard!')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-primary)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  Copy report
                </button>
              )}
            </div>

            {findings.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-sm text-[var(--md-sys-color-on-surface-variant)]">
                No known patterns matched. The log may be incomplete, or the cause is unusual. Try the AI deep analysis below.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {findings.map((f) => {
                  const style = SEVERITY_STYLES[f.rule.severity];
                  return (
                    <div
                      key={f.rule.id}
                      className={`rounded-2xl border ${style.border} ${style.bg} p-4 sm:p-5`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`material-symbols-outlined text-[18px] ${style.text}`}>{style.icon}</span>
                        <h3 className="font-bold text-sm text-[var(--md-sys-color-on-surface)] flex-1">{f.rule.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>{style.label}</span>
                      </div>
                      {f.matchedLines[0] && (
                        <pre className="font-mono text-[10px] sm:text-[11px] p-2.5 mb-3 rounded-lg bg-black/5 dark:bg-black/30 text-[var(--md-sys-color-on-surface)] overflow-x-auto whitespace-pre-wrap break-all max-h-28 overflow-y-auto">
                          {f.matchedLines.join('\n')}
                        </pre>
                      )}
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-2">
                        <span className="font-bold text-[var(--md-sys-color-on-surface)]">What happened: </span>
                        {f.rule.cause}
                      </p>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                        <span className="font-bold text-[var(--md-sys-color-on-surface)]">How to fix: </span>
                        {f.rule.fix}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Layer 2: AI deep analysis */}
        {(aiState !== 'idle' || findings === null) && (
          <section aria-label="AI deep analysis">
            <h2 className="font-headline font-bold text-lg text-[var(--md-sys-color-on-surface)] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-[20px]">psychology</span>
              AI deep analysis
            </h2>

            {aiState === 'loading' && (
              <div className="p-6 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full border-3 border-[var(--md-sys-color-outline-variant)] border-t-[var(--md-sys-color-primary)] animate-spin"
                  role="status"
                  aria-label="AI analysis in progress"
                />
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Reading the log and working out the cause...</p>
              </div>
            )}

            {aiState === 'error' && (
              <div
                role="alert"
                className="p-5 rounded-2xl border border-[var(--md-sys-color-error)]/50 bg-[var(--md-sys-color-surface-container-lowest)] flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-error)]">error</span>
                <div>
                  <p className="text-sm font-bold text-[var(--md-sys-color-error)] mb-1">AI analysis failed</p>
                  <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">{aiError}</p>
                  <button
                    type="button"
                    onClick={runDeepAnalysis}
                    className="mt-3 px-4 py-1.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {aiState === 'done' && aiResult && (
              <div className="rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        aiResult.confidence === 'high'
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                          : aiResult.confidence === 'medium'
                            ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
                            : 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {aiResult.confidence === 'high' ? 'check_circle' : aiResult.confidence === 'medium' ? 'info' : 'warning'}
                      </span>
                      {CONFIDENCE_LABEL[aiResult.confidence]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(buildReport(), 'Copied report to clipboard!')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-primary)] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    Copy report
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)] mb-1">Root cause</p>
                <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface)] mb-4 p-3 rounded-xl bg-[var(--md-sys-color-surface-container-lowest)] border-l-4 border-[var(--md-sys-color-primary)] leading-relaxed">
                  {aiResult.rootCause}
                </p>

                <p className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mb-1">In simple words</p>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-4">{aiResult.explanation}</p>

                <p className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mb-2">How to fix it</p>
                <ol className="space-y-2 mb-4">
                  {aiResult.fixes.map((fix, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="pt-1">{fix}</span>
                    </li>
                  ))}
                </ol>

                {aiResult.relatedErrors.length > 0 && (
                  <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                    <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)] mb-2">Errors seen in the log</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.relatedErrors.map((err, i) => (
                        <span
                          key={i}
                          className="font-mono-meta text-[10px] px-2 py-1 rounded bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] break-all max-w-full"
                        >
                          {err}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
