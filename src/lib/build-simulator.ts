import { mkdirSync, writeFileSync, cpSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execa } from "execa";

export type LogEntry = {
  type: "info" | "success" | "warning" | "error" | "command" | "system";
  text: string;
  timestamp: string;
};

export interface BuildEnvVars {
  buildTime: Record<string, string>;
  runtime: Record<string, string>;
}

function now() {
  const d = new Date();
  return d.toLocaleTimeString("en-US", { hour12: false });
}

function writeDeploymentHtml(
  deploymentId: string,
  projectName: string,
  framework: string,
  timestamp: string,
) {
  const dir = join(process.cwd(), "deployments-data", deploymentId);
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

  writeFileSync(join(dir, "index.html"), html, "utf-8");
}

export async function simulateBuild(
  project: {
    name: string;
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
      workDir = join(tmpdir(), `grob-build-${deploymentId}`);
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
      info(`Using install: ${project.installCommand}`);
      info(`Using build: ${project.buildCommand}`);
    }

    const runDir = workDir || process.cwd();

    if (hasGitUrl) {
      info(`Installing dependencies...`);
      cmd(`$ ${project.installCommand}`);
      const installResult = await execa(project.installCommand, {
        cwd: runDir,
        shell: true,
        timeout: 180_000,
        all: true,
        env: buildEnv,
      });
      for (const line of installResult.all?.split("\n").filter(Boolean) || []) {
        info(line);
      }

      ok(`Dependencies installed`);

      info(`Running build...`);
      cmd(`$ ${project.buildCommand}`);
      const buildResult = await execa(project.buildCommand, {
        cwd: runDir,
        shell: true,
        timeout: 300_000,
        all: true,
        env: buildEnv,
      });
      for (const line of buildResult.all?.split("\n").filter(Boolean) || []) {
        cmd(line);
      }
      ok(`Build completed successfully`);

      const deployPath = join(process.cwd(), "deployments-data", deploymentId);
      mkdirSync(deployPath, { recursive: true });

      // Check for Next.js standalone mode
      const nextStandalone = join(runDir, ".next", "standalone", "server.js");
      const nextOutput = join(runDir, ".next");

      if (existsSync(nextStandalone)) {
        // Next.js standalone mode — copy the full standalone output + static + public
        sys(`Detected Next.js standalone mode — copying server output...`);

        const standaloneDir = join(runDir, ".next", "standalone");
        cpSync(standaloneDir, deployPath, { recursive: true });

        // Copy .next/static into .next/static inside standalone
        const staticSrc = join(runDir, ".next", "static");
        const staticDest = join(deployPath, ".next", "static");
        if (existsSync(staticSrc)) {
          mkdirSync(staticDest, { recursive: true });
          cpSync(staticSrc, staticDest, { recursive: true });
        }

        // Copy public directory if it exists
        const publicSrc = join(runDir, "public");
        const publicDest = join(deployPath, "public");
        if (existsSync(publicSrc)) {
          mkdirSync(publicDest, { recursive: true });
          cpSync(publicSrc, publicDest, { recursive: true });
        }

        // Write runtime env vars file for the server to read
        if (envVars?.runtime && Object.keys(envVars.runtime).length > 0) {
          const envContent = Object.entries(envVars.runtime)
            .map(([k, v]) => `${k}=${v}`)
            .join("\n");
          writeFileSync(join(deployPath, ".env"), envContent, "utf-8");
        }

        // Write a marker file so the preview route knows this is a server
        writeFileSync(
          join(deployPath, ".grob-server"),
          JSON.stringify({ type: "nextjs-standalone", port: 3000 }),
          "utf-8",
        );

        ok(`Next.js standalone server copied`);
        info(`Server will be started on first request`);
      } else if (existsSync(nextOutput)) {
        // Next.js output mode (not standalone) — copy .next output for static export
        sys(`Detected Next.js output — copying build output...`);
        const outputPath = join(runDir, project.outputDir);
        if (existsSync(outputPath) && project.outputDir !== ".next") {
          cpSync(outputPath, deployPath, { recursive: true });
          ok(`Output copied from ${project.outputDir}`);
        } else {
          // Copy the full .next directory for potential SSR
          cpSync(nextOutput, deployPath, { recursive: true });

          // Copy public directory
          const publicSrc = join(runDir, "public");
          if (existsSync(publicSrc)) {
            cpSync(publicSrc, join(deployPath, "public"), { recursive: true });
          }

          // Write runtime env vars
          if (envVars?.runtime && Object.keys(envVars.runtime).length > 0) {
            const envContent = Object.entries(envVars.runtime)
              .map(([k, v]) => `${k}=${v}`)
              .join("\n");
            writeFileSync(join(deployPath, ".env"), envContent, "utf-8");
          }

          writeFileSync(
            join(deployPath, ".grob-server"),
            JSON.stringify({ type: "nextjs", port: 3000 }),
            "utf-8",
          );

          ok(`Next.js build output copied`);
        }
      } else {
        // Generic static output
        const outputPath = join(runDir, project.outputDir);
        if (existsSync(outputPath)) {
          cpSync(outputPath, deployPath, { recursive: true });
          ok(`Output copied from ${project.outputDir}`);
        } else {
          warn(`Output directory "${project.outputDir}" not found — copying common outputs`);
          const files = ["index.html", "out", "dist", "build"].filter(
            (f) => existsSync(join(runDir, f)),
          );
          for (const f of files) {
            const src = join(runDir, f);
            const dest = join(deployPath, f);
            if (existsSync(src)) {
              cpSync(src, dest, { recursive: true });
            }
          }
        }

        // Write runtime env vars for any framework
        if (envVars?.runtime && Object.keys(envVars.runtime).length > 0) {
          const envContent = Object.entries(envVars.runtime)
            .map(([k, v]) => `${k}=${v}`)
            .join("\n");
          writeFileSync(join(deployPath, ".env"), envContent, "utf-8");
        }
      }
    } else {
      writeDeploymentHtml(deploymentId, project.name, project.framework, t());
    }

    const url = `localhost:3000/preview/${deploymentId}`;

    ok(`Deployment complete!`);
    sys(`URL: http://${url}`);

    return url;
  } catch (e: any) {
    failed = true;
    err(`Deployment failed: ${e?.message || e}`);
    if (e?.all) {
      for (const line of e.all.split("\n").filter(Boolean)) {
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
