import { mkdirSync, writeFileSync, cpSync, existsSync, rmSync, readdirSync, statSync, symlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execa } from "execa";
import { detectLanguage, getLanguageById, type LanguageProfile } from "./languages";

export type LogEntry = {
  type: "info" | "success" | "warning" | "error" | "command" | "system";
  text: string;
  timestamp: string;
};

export interface BuildEnvVars {
  buildTime: Record<string, string>;
  runtime: Record<string, string>;
}

export interface ServerMarker {
  type: string;
  languageId: string;
  startCmd: string;
  startArgs: string[];
  startCwd: string;
  port: number;
}

function now() {
  const d = new Date();
  return d.toLocaleTimeString("en-US", { hour12: false });
}

function collectFiles(dir: string, prefix = "", results: string[] = []): string[] {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) continue;
      const full = join(/*turbopackIgnore: true*/ dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      try {
        if (statSync(full).isDirectory()) {
          collectFiles(full, rel, results);
        } else {
          results.push(rel);
        }
      } catch {
        // skip unreadable
      }
    }
  } catch {
    // skip unreadable dirs
  }
  return results;
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

function detectPackageManager(files: string[]): PackageManager {
  if (files.some((f) => f === "pnpm-lock.yaml")) return "pnpm";
  if (files.some((f) => f === "yarn.lock")) return "yarn";
  if (files.some((f) => f === "bun.lockb" || f === "bun.lock")) return "bun";
  return "npm";
}

function getPmCommands(pm: PackageManager) {
  return {
    npm:  { install: "npm install",  run: "npm run" },
    pnpm: { install: "pnpm install", run: "pnpm" },
    yarn: { install: "yarn install", run: "yarn" },
    bun:  { install: "bun install",  run: "bun run" },
  }[pm];
}

function runWithOrAlternatives(
  command: string,
  cwd: string,
  env: Record<string, string>,
): Promise<{ ok: boolean; output: string }> {
  // Handle "or" separated alternatives like "lein deps" + "or" + "clojure -P"
  const alternatives = command.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);

  return tryCommands(alternatives, 0, cwd, env);
}

async function tryCommands(
  commands: string[],
  index: number,
  cwd: string,
  env: Record<string, string>,
): Promise<{ ok: boolean; output: string }> {
  if (index >= commands.length) {
    return { ok: false, output: "No alternative commands succeeded" };
  }

  const cmd = commands[index];
  try {
    const result = await execa(cmd, {
      cwd,
      shell: true,
      timeout: 300_000,
      all: true,
      env,
    });
    return { ok: true, output: result.all || "" };
  } catch (e: unknown) {
    if (index < commands.length - 1) {
      return tryCommands(commands, index + 1, cwd, env);
    }
    const msg = e instanceof Error ? e.message : String(e);
    const all = typeof e === "object" && e !== null && "all" in e ? (e as { all: string }).all : undefined;
    return { ok: false, output: all || msg };
  }
}

function writeDeploymentHtml(
  deploymentId: string,
  projectName: string,
  framework: string,
  timestamp: string,
) {
  const dir = join(/*turbopackIgnore: true*/ process.cwd(), "deployments-data", deploymentId);
  mkdirSync(dir, { recursive: true });

  const buildTime = new Date().toISOString();
  const accent = "#6E5BFF";
  const bg = "#0B0E14";
  const surface = "#12151D";
  const border = "#212633";
  const text = "#E7E9EE";
  const muted = "#8B92A4";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName} — Grob Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${bg}; color: ${text}; font-family: Inter, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
    .topbar { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-bottom: 1px solid ${border}; font-size: 14px; }
    .topbar-logo { width: 24px; height: 24px; background: ${accent}; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; }
    .topbar-name { font-weight: 600; }
    .topbar-badge { margin-left: auto; font-size: 11px; color: ${muted}; background: ${surface}; padding: 2px 10px; border-radius: 999px; border: 1px solid ${border}; }
    .hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
    .hero-icon { width: 64px; height: 64px; background: ${accent}15; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
    .hero-icon svg { width: 32px; height: 32px; color: ${accent}; }
    h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; }
    .subtitle { color: ${muted}; font-size: 15px; margin-bottom: 24px; }
    .meta { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px; }
    .meta-item { background: ${surface}; border: 1px solid ${border}; border-radius: 8px; padding: 8px 16px; font-size: 13px; }
    .meta-label { color: ${muted}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { margin-top: 2px; font-weight: 500; }
    .footer { padding: 16px 24px; border-top: 1px solid ${border}; font-size: 12px; color: ${muted}; text-align: center; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="topbar-logo">G</div>
    <span class="topbar-name">${projectName}</span>
    <span class="topbar-badge">Grob Preview</span>
  </div>

  <div class="hero">
    <div class="hero-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </div>
    <h1>${projectName}</h1>
    <p class="subtitle">Deployed via Grob &middot; ${framework || "Custom"} &middot; ${buildTime.split("T")[0]}</p>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Framework</div>
        <div class="meta-value">${framework || "Custom"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Deployment ID</div>
        <div class="meta-value"><code>${deploymentId.slice(0, 8)}</code></div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Timestamp</div>
        <div class="meta-value">${timestamp}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Preview served by Grob &mdash; ${buildTime.split("T")[0]}
  </div>
</body>
</html>`;

  writeFileSync(join(/*turbopackIgnore: true*/ dir, "index.html"), html, "utf-8");
}

function writeServerMarker(
  deployPath: string,
  languageId: string,
  startCmd: string,
  startArgs: string[],
  startCwd: string,
  port: number,
) {
  const marker: ServerMarker = {
    type: languageId,
    languageId,
    startCmd,
    startArgs,
    startCwd,
    port,
  };
  writeFileSync(join(/*turbopackIgnore: true*/ deployPath, ".grob-server"), JSON.stringify(marker), "utf-8");
}

export async function deployBuild(
  project: {
    name: string;
    slug?: string;
    gitUrl: string;
    installCommand: string;
    buildCommand: string;
    outputDir: string;
    framework: string;
  },
  deploymentId: string,
  onLog: (entry: LogEntry) => void,
  envVars?: BuildEnvVars,
) {
  const t = () => now();
  let failed = false;
  let workDir = "";

  const info = (text: string) => onLog({ type: "info", text, timestamp: t() });
  const ok = (text: string) => onLog({ type: "success", text, timestamp: t() });
  const warn = (text: string) => onLog({ type: "warning", text, timestamp: t() });
  const err = (text: string) => onLog({ type: "error", text, timestamp: t() });
  const cmd = (text: string) => onLog({ type: "command", text, timestamp: t() });
  const sys = (text: string) => onLog({ type: "system", text, timestamp: t() });

  const buildEnv: Record<string, string> = {
    ...process.env,
    ...envVars?.buildTime,
    NODE_ENV: "production",
  };

  try {
    const hasGitUrl = project.gitUrl && project.gitUrl.trim().length > 0;

    if (hasGitUrl) {
      workDir = join(/*turbopackIgnore: true*/ tmpdir(), `grob-build-${deploymentId}`);
      mkdirSync(workDir, { recursive: true });

      sys(`Cloning ${project.gitUrl}...`);
      cmd(`$ git clone ${project.gitUrl} .`);

      const cloneResult = await execa("git", ["clone", project.gitUrl, workDir], {
        timeout: 120_000,
        all: true,
      });
      for (const line of cloneResult.all?.split("\n").filter(Boolean) || []) {
        sys(line);
      }
      ok(`Cloned repository (${project.gitUrl})`);
    } else {
      ok(`No git URL — deploying preview page only`);
    }

    const runDir = workDir || process.cwd();
    const deployPath = join(/*turbopackIgnore: true*/ process.cwd(), "deployments-data", deploymentId);
    mkdirSync(deployPath, { recursive: true });

    if (hasGitUrl) {
      // Detect language from repo files
      sys(`Detecting project language/framework...`);
      const files = collectFiles(runDir);

      let detectedLang: LanguageProfile | null = null;

      // If user explicitly set a framework, try to find it first
      if (project.framework && project.framework !== "other") {
        detectedLang = getLanguageById(project.framework) || null;
      }

      // Fall back to auto-detection
      if (!detectedLang) {
        detectedLang = detectLanguage(files);
      }

      if (detectedLang) {
        sys(`Detected: ${detectedLang.icon} ${detectedLang.name}`);
        info(`Language profile: ${detectedLang.id}`);
      } else {
        sys(`No known language detected — using project commands`);
      }

      // Detect package manager from lockfiles (for JS/TS projects)
      const pm = detectPackageManager(files);
      const pmCmds = getPmCommands(pm);
      sys(`Package manager: ${pm}`);

      // Resolve install commands: user override > auto-detected pm > profile default
      let installCmds: string[];
      if (project.installCommand) {
        installCmds = [project.installCommand];
      } else if (detectedLang?.install?.length) {
        // If profile uses generic "npm install", swap in detected pm
        installCmds = detectedLang.install.map((cmd) => {
          if (cmd === "npm install") return pmCmds.install;
          if (cmd === "npm run build") return `${pmCmds.run} build`;
          return cmd;
        });
      } else {
        installCmds = [];
      }

      // Resolve build commands: user override > profile default (with pm substitution)
      let buildCmds: string[];
      if (project.buildCommand) {
        buildCmds = [project.buildCommand];
      } else if (detectedLang?.build?.length) {
        buildCmds = detectedLang.build.map((cmd) => {
          if (cmd === "npm run build") return `${pmCmds.run} build`;
          if (cmd === "npm install") return pmCmds.install;
          return cmd;
        });
      } else {
        buildCmds = [];
      }

      // Resolve output directory: user override > profile default
      const outputDir = project.outputDir || detectedLang?.outputDirs?.[0] || ".";

      // Merge profile env defaults with build env
      if (detectedLang?.env) {
        Object.assign(buildEnv, detectedLang.env);
      }

      // Run install steps
      for (const installCmd of installCmds) {
        if (!installCmd.trim()) continue;
        info(`Installing dependencies...`);
        cmd(`$ ${installCmd}`);

        const result = await runWithOrAlternatives(installCmd, runDir, buildEnv);
        for (const line of result.output.split("\n").filter(Boolean)) {
          info(line);
        }
        if (!result.ok) {
          err(`Install failed for: ${installCmd}`);
          throw new Error(`Install failed: ${result.output}`);
        }
        ok(`Dependencies installed`);
      }

      // Run build steps
      for (const buildCmd of buildCmds) {
        if (!buildCmd.trim()) continue;
        info(`Building...`);
        cmd(`$ ${buildCmd}`);

        const result = await runWithOrAlternatives(buildCmd, runDir, buildEnv);
        for (const line of result.output.split("\n").filter(Boolean)) {
          cmd(line);
        }
        if (!result.ok) {
          err(`Build failed for: ${buildCmd}`);
          throw new Error(`Build failed: ${result.output}`);
        }
        ok(`Build step completed`);
      }

      // ── Copy output to deploy directory ──
      const langId = detectedLang?.id || "unknown";

      // Special handling for known framework output patterns
      if (langId === "nextjs" || langId === "nextjs-static") {
        await copyNextjsOutput(runDir, deployPath, outputDir, envVars, langId, deploymentId, ok, sys, info, warn);
      } else {
        // Generic: copy output directory
        await copyGenericOutput(runDir, deployPath, outputDir, detectedLang, envVars, deploymentId, ok, sys, info, warn, langId);
      }
    } else {
      writeDeploymentHtml(deploymentId, project.name, project.framework, t());
    }

    const slug = project.slug || project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const url = `${slug}.localhost:3000`;

    ok(`Deployment complete!`);
    sys(`URL: http://${url}`);

    return url;
  } catch (e: unknown) {
    failed = true;
    const msg = e instanceof Error ? e.message : String(e);
    err(`Deployment failed: ${msg}`);
    const all = typeof e === "object" && e !== null && "all" in e ? (e as { all: string }).all : undefined;
    if (all) {
      for (const line of all.split("\n").filter(Boolean)) {
        err(line);
      }
    }
  } finally {
    if (workDir && existsSync(workDir)) {
      try {
        rmSync(workDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
    if (!failed) {
      info(`Deployment finished at ${t()}`);
    }
  }
}

async function copyNextjsOutput(
  runDir: string,
  deployPath: string,
  outputDir: string,
  envVars: BuildEnvVars | undefined,
  langId: string,
  deploymentId: string,
  ok: (t: string) => void,
  sys: (t: string) => void,
  info: (t: string) => void,
  warn: (t: string) => void,
) {
  const nextStandalone = join(/*turbopackIgnore: true*/ runDir, ".next", "standalone", "server.js");

  if (existsSync(nextStandalone)) {
    sys(`Detected Next.js standalone mode — copying server output...`);

    const standaloneDir = join(/*turbopackIgnore: true*/ runDir, ".next", "standalone");
    cpSync(standaloneDir, deployPath, { recursive: true });

    const staticSrc = join(/*turbopackIgnore: true*/ runDir, ".next", "static");
    const staticDest = join(/*turbopackIgnore: true*/ deployPath, ".next", "static");
    if (existsSync(staticSrc)) {
      mkdirSync(staticDest, { recursive: true });
      cpSync(staticSrc, staticDest, { recursive: true });
    }

    const publicSrc = join(/*turbopackIgnore: true*/ runDir, "public");
    const publicDest = join(/*turbopackIgnore: true*/ deployPath, "public");
    if (existsSync(publicSrc)) {
      mkdirSync(publicDest, { recursive: true });
      cpSync(publicSrc, publicDest, { recursive: true });
    }

    writeRuntimeEnv(deployPath, envVars);
    writeServerMarker(deployPath, "nextjs-standalone", "node", ["server.js"], ".", 3000);

    // Create _next symlink for static file resolution
    const nextSrc = join(/*turbopackIgnore: true*/ deployPath, ".next");
    const nextLink = join(/*turbopackIgnore: true*/ deployPath, "_next");
    if (existsSync(nextSrc) && !existsSync(nextLink)) {
      try {
        symlinkSync(nextSrc, nextLink);
        sys(`Created _next symlink for static file resolution`);
      } catch {
        warn(`Failed to create _next symlink — static files may not resolve`);
      }
    }

    ok(`Next.js standalone server copied`);
    info(`Server will be started on first request`);
  } else {
    sys(`Detected Next.js output — copying build output...`);

    const nextDest = join(/*turbopackIgnore: true*/ deployPath, ".next");
    const nextOutput = join(/*turbopackIgnore: true*/ runDir, ".next");
    if (existsSync(nextOutput)) {
      cpSync(nextOutput, nextDest, { recursive: true });
    }

    const publicSrc = join(/*turbopackIgnore: true*/ runDir, "public");
    if (existsSync(publicSrc)) {
      cpSync(publicSrc, join(/*turbopackIgnore: true*/ deployPath, "public"), { recursive: true });
    }

    const pkgSrc = join(/*turbopackIgnore: true*/ runDir, "package.json");
    if (existsSync(pkgSrc)) {
      cpSync(pkgSrc, join(/*turbopackIgnore: true*/ deployPath, "package.json"));
    }

    writeRuntimeEnv(deployPath, envVars);

    // Create _next symlink so static files resolve via any server
    const nextSrc = join(/*turbopackIgnore: true*/ deployPath, ".next");
    const nextLink = join(/*turbopackIgnore: true*/ deployPath, "_next");
    if (existsSync(nextSrc) && !existsSync(nextLink)) {
      try {
        symlinkSync(nextSrc, nextLink);
        sys(`Created _next symlink for static file resolution`);
      } catch {
        warn(`Failed to create _next symlink — static files may not resolve`);
      }
    }

    sys(`Installing next runtime...`);
    try {
      await execa("npm", ["install", "--save", "next@latest"], {
        cwd: deployPath,
        shell: true,
        timeout: 120_000,
        all: true,
        env: { ...process.env, NODE_ENV: "production" },
      });
      sys(`Next.js runtime installed`);
    } catch {
      warn(`Failed to install next — falling back to static serve`);
      writeServerMarker(deployPath, "nextjs", "npx", ["serve", "."], ".", 3000);

      // Create _next symlink even for static fallback
      const nextSrcFallback = join(/*turbopackIgnore: true*/ deployPath, ".next");
      const nextLinkFallback = join(/*turbopackIgnore: true*/ deployPath, "_next");
      if (existsSync(nextSrcFallback) && !existsSync(nextLinkFallback)) {
        try {
          symlinkSync(nextSrcFallback, nextLinkFallback);
          sys(`Created _next symlink for static file resolution`);
        } catch {
          warn(`Failed to create _next symlink — static files may not resolve`);
        }
      }

      ok(`Next.js build output copied`);
      return;
    }

    writeServerMarker(deployPath, "nextjs", "npx", ["next", "start"], ".", 3000);
    ok(`Next.js server ready`);
  }
}

async function copyGenericOutput(
  runDir: string,
  deployPath: string,
  outputDir: string,
  detectedLang: LanguageProfile | null,
  envVars: BuildEnvVars | undefined,
  deploymentId: string,
  ok: (t: string) => void,
  sys: (t: string) => void,
  info: (t: string) => void,
  warn: (t: string) => void,
  langId: string,
) {
  const outputPath = join(/*turbopackIgnore: true*/ runDir, outputDir);

  if (existsSync(outputPath)) {
    cpSync(outputPath, deployPath, { recursive: true });
    ok(`Output copied from ${outputDir}`);
  } else {
    warn(`Output directory "${outputDir}" not found — trying common outputs`);
    const candidates = ["dist", "build", "out", "public", "_site", "target/release", "target"];
    let found = false;
    for (const candidate of candidates) {
      const src = join(/*turbopackIgnore: true*/ runDir, candidate);
      if (existsSync(src) && statSync(src).isDirectory()) {
        cpSync(src, join(/*turbopackIgnore: true*/ deployPath, candidate), { recursive: true });
        ok(`Copied output from ${candidate}`);
        found = true;
        break;
      }
    }
    if (!found) {
      // Last resort: copy everything except node_modules, .git
      const entries = readdirSync(runDir).filter(
        (e) => !["node_modules", ".git", ".next"].includes(e) && !e.startsWith("."),
      );
      for (const entry of entries) {
        const src = join(/*turbopackIgnore: true*/ runDir, entry);
        try {
          cpSync(src, join(/*turbopackIgnore: true*/ deployPath, entry), { recursive: true });
        } catch {
          // skip
        }
      }
      warn(`Copied all project files as fallback`);
    }
  }

  writeRuntimeEnv(deployPath, envVars);

  // Create _next symlink for static file resolution (for Next.js-like builds)
  const nextSrcGeneric = join(/*turbopackIgnore: true*/ deployPath, ".next");
  const nextLinkGeneric = join(/*turbopackIgnore: true*/ deployPath, "_next");
  if (existsSync(nextSrcGeneric) && !existsSync(nextLinkGeneric)) {
    try {
      symlinkSync(nextSrcGeneric, nextLinkGeneric);
      sys(`Created _next symlink for static file resolution`);
    } catch {
      // not a Next.js build, skip
    }
  }

  // Build the start command from the language profile
  if (detectedLang) {
    const start = detectedLang.startCommand(3000, deployPath);
    writeServerMarker(deployPath, langId, start.cmd, start.args, start.cwd || ".", 3000);
    sys(`Server configured: ${start.cmd} ${start.args.join(" ")}`);
  } else {
    // Unknown language — try to serve statically
    writeServerMarker(deployPath, "static", "npx", ["serve", "."], ".", 3000);
  }

  ok(`${detectedLang?.name || "Project"} output ready`);
}

function writeRuntimeEnv(deployPath: string, envVars: BuildEnvVars | undefined) {
  if (envVars?.runtime && Object.keys(envVars.runtime).length > 0) {
    const envContent = Object.entries(envVars.runtime)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    writeFileSync(join(/*turbopackIgnore: true*/ deployPath, ".env"), envContent, "utf-8");
  }
}

export function logEntriesToString(entries: LogEntry[]) {
  return entries
    .map((e) => {
      const prefix =
        e.type === "success"
          ? "✓"
          : e.type === "warning"
            ? "⚠"
            : e.type === "error"
              ? "✗"
              : e.type === "command"
                ? "$"
                : e.type === "system"
                  ? "■"
                  : "→";
      return `[${e.timestamp}] ${prefix} ${e.text}`;
    })
    .join("\n");
}

export function parseLogLine(
  line: string,
): { type: LogEntry["type"]; text: string; timestamp: string } | null {
  const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\] ([✓⚠✗$■→]) (.*)$/);
  if (!match) return null;
  const [, timestamp, prefix, text] = match;
  const typeMap: Record<string, LogEntry["type"]> = {
    "✓": "success",
    "⚠": "warning",
    "✗": "error",
    "$": "command",
    "■": "system",
    "→": "info",
  };
  return { type: typeMap[prefix] || "info", text, timestamp };
}
