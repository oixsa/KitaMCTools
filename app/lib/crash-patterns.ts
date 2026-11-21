/**
 * Local crash log pattern rules engine.
 * Each rule matches real Minecraft log lines client side, no API key required.
 */

export type CrashCategory = 'mod' | 'java' | 'memory' | 'world' | 'network' | 'graphics' | 'other';
export type CrashSeverity = 'error' | 'warning' | 'info';

export interface CrashRule {
  id: string;
  name: string;
  category: CrashCategory;
  patterns: RegExp[];
  cause: string;
  fix: string;
  severity: CrashSeverity;
}

export interface RuleFinding {
  rule: CrashRule;
  matchedLines: string[];
}

export const CRASH_RULES: CrashRule[] = [
  {
    id: 'nosuch-method-field',
    name: 'Missing method or field (mod incompatibility)',
    category: 'mod',
    patterns: [
      /java\.lang\.NoSuchMethodError:/i,
      /java\.lang\.NoSuchFieldError:/i,
      /java\.lang\.ClassNotFoundException:/i,
      /java\.lang\.NoClassDefFoundError:/i,
    ],
    cause:
      'Two mods are fighting over the same code, or a mod was built for a different Minecraft or mod loader version. One mod asked for a piece of code that does not exist in your version.',
    fix:
      'Note the mod named in the error line. Update that mod and the mods it depends on to versions matching your Minecraft version. If the error names a Minecraft class, one mod is for the wrong game version: remove it or swap it for the correct version.',
    severity: 'error',
  },
  {
    id: 'missing-dependency',
    name: 'Missing mod dependency',
    category: 'mod',
    patterns: [
      /Missing or unsupported mandatory dependencies/i,
      /Mod file .+ is missing dependencies/i,
      /requires .*mod/i,
      /Missing Mods?:(.+)/i,
      /Missing mandatory dependencies/i,
    ],
    cause:
      'A mod needs another mod installed to work, and that helper mod is missing or the wrong version.',
    fix:
      'Read the error line: it lists exactly which mod (and version) is missing. Download that dependency from the same site you got the main mod, put it in the mods folder, and restart.',
    severity: 'error',
  },
  {
    id: 'loader-mismatch',
    name: 'Fabric and Forge mixed up',
    category: 'mod',
    patterns: [
      /fabric-loader/i,
      /The Mod .* requires mod loader versions/i,
      /fml\.loader.*incompatible/i,
      /Attempted to load (a )?Fabric/i,
      /net\.fabricmc\./i,
    ],
    cause:
      'Fabric mods were loaded by Forge, or the other way around. The two loaders cannot run each other’s mods.',
    fix:
      'Check your mods folder. If you run Forge, remove every Fabric mod (they usually say fabric in the file name or on the download page). If you run Fabric, remove Forge mods. Some mods have both versions, make sure you downloaded the one for your loader.',
    severity: 'error',
  },
  {
    id: 'out-of-memory',
    name: 'Out of memory',
    category: 'memory',
    patterns: [
      /java\.lang\.OutOfMemoryError/i,
      /Not enough memory/i,
      /Unable to allocate .* bytes/i,
      /Failed to allocate/i,
      /Out of memory!/i,
    ],
    cause:
      'Minecraft ran out of RAM. Either the game was given too little memory, or more memory was requested than the computer actually has.',
    fix:
      'In your launcher, raise the allocated RAM to 4 to 6 GB (do not exceed your PC’s total RAM; on 8 GB machines keep it at 4 GB or lower). If it already has plenty, lower the render distance and close other programs, or check for a memory leak in a recent mod.',
    severity: 'error',
  },
  {
    id: 'java-version',
    name: 'Wrong Java version',
    category: 'java',
    patterns: [
      /UnsupportedClassVersionError/i,
      /Unsupported Java/i,
      /requires (Java|java) \d+/i,
      /class file (major )?version (\d+)/i,
      /has been compiled by a more recent version of the Java Runtime/i,
    ],
    cause:
      'The mod, server, or launcher was built for a different Java version than the one running it. Class file major version 65 means Java 21, 61 means Java 17.',
    fix:
      'Install the Java version the error asks for (Java 21 for Minecraft 1.20.5+, Java 17 for 1.18 to 1.20.4). In your launcher, select that Java installation, then start the game again.',
    severity: 'error',
  },
  {
    id: 'graphics-driver',
    name: 'Graphics or OpenGL error',
    category: 'graphics',
    patterns: [
      /GLFW (error|Error)/i,
      /OpenGL/i,
      /GL_ERROR/i,
      /Failed to create (window|OpenGL context)/i,
      /org\.lwjgl\.\w*GL\w*Error/i,
      /Driver does not appear to support OpenGL/i,
    ],
    cause:
      'The graphics driver failed while Minecraft tried to draw the game. This is usually an outdated or broken graphics driver, or unsupported OpenGL on the machine.',
    fix:
      'Update your graphics drivers (NVIDIA, AMD, or Intel, from their official site). If you use a laptop, make sure Minecraft runs on the dedicated GPU. Lowering render distance and disabling shaders can also help older machines.',
    severity: 'error',
  },
  {
    id: 'world-corruption',
    name: 'World or data corruption',
    category: 'world',
    patterns: [
      /Failed to load level/i,
      /corrupt/i,
      /Failed to (read|load) (chunk|level|world)/i,
      /IOException while loading/i,
      /An IOException was thrown/i,
    ],
    cause:
      'A chunk or world data file is damaged, so Minecraft cannot load the world safely. This often follows a crash while saving or an unsafe shutdown.',
    fix:
      'Back up the world save folder first, then try loading it again. If it still fails, restore from an older backup. Tools like MCASelector can remove just the broken chunks if you do not have a backup. Check your disk for errors too.',
    severity: 'error',
  },
  {
    id: 'duplicate-mod',
    name: 'Duplicate mod loaded twice',
    category: 'mod',
    patterns: [
      /Duplicate (mod|Mod) /i,
      /duplicate mod id/i,
      /Duplicate module/i,
      /has already been registered/i,
      /DuplicateModsFoundException/i,
    ],
    cause:
      'The same mod is in the mods folder twice, for example an old jar and a new jar, or a merged all-in-one pack plus the standalone mod.',
    fix:
      'Open your mods folder and delete the older duplicate of the mod named in the error. Keep only one copy of each mod.',
    severity: 'error',
  },
  {
    id: 'optifine-forge',
    name: 'OptiFine and Forge conflict',
    category: 'graphics',
    patterns: [
      /optifine/i,
      /OptiFineTransformationService/i,
      /optifine.*incompatible/i,
    ],
    cause:
      'OptiFine is installed alongside Forge and the combination is unstable on this version. OptiFine only works with certain Forge versions.',
    fix:
      'Either use the Forge and OptiFine combination versions that are officially reported to work together, or replace OptiFine with the performance mods Sodium plus Lithium style alternatives made for your loader.',
    severity: 'warning',
  },
  {
    id: 'config-error',
    name: 'Broken or missing config file',
    category: 'other',
    patterns: [
      /com\.electronwill\.night-config/i,
      /Config error/i,
      /Failed to (parse|load) config/i,
      /Invalid config file/i,
      /config\.toml/i,
    ],
    cause:
      'A mod config file (usually a .toml file) is damaged or contains a value the mod cannot read, often after an update changed the format.',
    fix:
      'Close the game, go to the config folder, and delete the config file of the mod named in the error. A fresh copy is created on the next launch. Re-check your settings afterwards.',
    severity: 'error',
  },
  {
    id: 'mixin-failure',
    name: 'Mixin apply failure',
    category: 'mod',
    patterns: [
      /Mixin apply failed/i,
      /MixinApplyError/i,
      /could not be applied/i,
      /Mixin targeting error/i,
      /org\.spongepowered\.asm\.mixin/i,
    ],
    cause:
      'A mod tried to patch Minecraft’s code but the part it expects changed in this game version, so the patch could not be applied.',
    fix:
      'The mod named in the mixin error is out of date for your Minecraft version. Update it or remove it. If several mods use mixins, update the one listed first in the error.',
    severity: 'error',
  },
  {
    id: 'fatal-shutdown',
    name: 'Fatal shutdown detected',
    category: 'other',
    patterns: [
      /shutting down/i,
      /FATAL/i,
      /A fatal error has been detected/i,
      /Stopping the server/i,
      /EXIT CODE \d+/i,
    ],
    cause:
      'The log contains a shutdown or fatal marker, so the game or server ended unexpectedly instead of closing normally.',
    fix:
      'Check the lines just before the shutdown message: they usually name the real problem. Match that message against the other findings on this page.',
    severity: 'info',
  },
  {
    id: 'network-error',
    name: 'Network or connection error',
    category: 'network',
    patterns: [
      /Connection (reset|refused|timed out)/i,
      /Failed to connect to (server|session)/i,
      /SocketException/i,
      /UnknownHostException/i,
      /handshake/i,
    ],
    cause:
      'The game or server lost its network connection, or a session service could not be reached.',
    fix:
      'Check your internet connection and any firewall or antivirus rules for Java. On servers, verify the address and port are correct and that the server is online. If a session service is down, try again later.',
    severity: 'warning',
  },
  {
    id: 'access-violation',
    name: 'Native crash (access violation)',
    category: 'other',
    patterns: [
      /EXCEPTION_ACCESS_VIOLATION/i,
      /The game crashed. Error: .+EXCEPTION_/i,
      /hs_err_pid/i,
      /sigsegv/i,
    ],
    cause:
      'Minecraft crashed inside native code, most often the graphics driver, shader mods, or faulty RAM rather than normal Java code.',
    fix:
      'Update your GPU drivers first, remove shader or render mods, and run a memory test if it keeps happening. The hs_err file next to the crash report names the module that crashed.',
    severity: 'error',
  },
];

/**
 * Match all rules against a log string and collect matching lines.
 * Tailwind v4 style is not relevant here; this stays plain data.
 */
export function analyzeLog(log: string): RuleFinding[] {
  const lines = log.split('\n');
  const findings: RuleFinding[] = [];

  for (const rule of CRASH_RULES) {
    const matchedLines: string[] = [];
    for (const pattern of rule.patterns) {
      for (const line of lines) {
        if (pattern.test(line) && !matchedLines.includes(line)) {
          matchedLines.push(line.trim().slice(0, 300));
        }
      }
    }
    if (matchedLines.length > 0) {
      findings.push({ rule, matchedLines: matchedLines.slice(0, 5) });
    }
  }

  // Errors first, then warnings, then info context
  const order: Record<CrashSeverity, number> = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => order[a.rule.severity] - order[b.rule.severity]);
  return findings;
}
