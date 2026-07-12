import { readFileSync, existsSync, lstatSync, readdirSync } from "fs";
import { join, extname } from "path";
import { execa } from "execa";
import type { ServerMarker } from "@/lib/build";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wasm": "application/wasm",
};

const runningServers = new Map<string, ReturnType<typeof execa>>();

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPort(deploymentId: string): number {
  return 10000 + (hashString(deploymentId) % 50000);
}

function loadEnvFile(deployDir: string): Record<string, string> {
  const envFile = join(deployDir, ".env");
  const env: Record<string, string> = {};
  if (existsSync(envFile)) {
    const content = readFileSync(envFile, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
      }
    }
  }
  return env;
}

async function waitForServer(port: number, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, {
        method: "HEAD",
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok || res.status < 500) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function resolveStartCwd(marker: ServerMarker, deployDir: string): string {
  if (!marker.startCwd || marker.startCwd === ".") return deployDir;
  if (marker.startCwd.startsWith("/")) return marker.startCwd;
  return join(deployDir, marker.startCwd);
}

function interpolatePort(args: string[], port: number): string[] {
  return args.map((a) => {
    // Replace PORT placeholder or bare "3000" port references
    if (a === "PORT" || a === "${PORT}") return String(port);
    if (a === "3000" || a === ":3000" || a === "-p 3000" || a === "--port=3000" || a === "--port") return a;
    return a.replace(/3000/g, String(port));
  });
}

async function getOrCreateServer(
  deploymentId: string,
  deployDir: string,
): Promise<{ port: number; ready: boolean }> {
  const markerPath = join(deployDir, ".grob-server");
  if (!existsSync(markerPath)) return { port: 0, ready: false };

  const existing = runningServers.get(deploymentId);
  if (existing && !existing.killed) {
    return { port: getPort(deploymentId), ready: true };
  }

  let marker: ServerMarker;
  try {
    marker = JSON.parse(readFileSync(markerPath, "utf-8"));
  } catch {
    return { port: 0, ready: false };
  }

  const port = getPort(deploymentId);
  const runtimeEnv = loadEnvFile(deployDir);
  const cwd = resolveStartCwd(marker, deployDir);
  const env = { ...process.env, ...runtimeEnv, PORT: String(port) };

  // Resolve the start command — interpolate port into args
  let startArgs = interpolatePort(marker.startArgs, port);
  const startCmd = marker.startCmd;

  // For static server (npx serve), always use absolute deployDir and explicit port
  if (startCmd === "npx" && startArgs[0] === "serve") {
    startArgs = ["serve", deployDir, "-l", String(port)];
  }

  try {
    const child = execa(startCmd, startArgs, {
      cwd,
      env,
      stdio: "pipe",
      detached: false,
    });
    runningServers.set(deploymentId, child);
    child.on("error", () => runningServers.delete(deploymentId));
    child.on("exit", () => runningServers.delete(deploymentId));

    // Longer timeout for compiled languages (Java, Rust, Go) that may need startup time
    const timeoutMs = ["java", "dotnet", "cargo", "go", "cabal", "mix", "bundle"].includes(startCmd) ? 30000 : 15000;
    const ready = await waitForServer(port, timeoutMs);
    return { port, ready };
  } catch {
    return { port: 0, ready: false };
  }
}

async function proxyRequest(
  req: Request,
  deploymentId: string,
  pathParts: string[],
): Promise<Response> {
  const deployDir = join(process.cwd(), "deployments-data", deploymentId);
  if (!existsSync(deployDir)) {
    return new Response("Deployment not found", { status: 404 });
  }

  const markerPath = join(deployDir, ".grob-server");
  if (!existsSync(markerPath)) {
    return new Response("Not a server deployment", { status: 404 });
  }

  const { port, ready } = await getOrCreateServer(deploymentId, deployDir);
  if (!ready || port <= 0) {
    return new Response("Server not ready", { status: 503 });
  }

  const targetPath = pathParts.length > 0 ? "/" + pathParts.join("/") : "/";

  try {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key !== "host") headers.set(key, value);
    });

    const proxyRes = await fetch(`http://127.0.0.1:${port}${targetPath}`, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      signal: AbortSignal.timeout(30000),
    });

    const responseHeaders = new Headers();
    proxyRes.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response("Server error", { status: 502 });
  }
}

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const [deploymentId, ...pathParts] = slug;
  const deployDir = join(process.cwd(), "deployments-data", deploymentId);

  if (!existsSync(deployDir)) {
    return new Response("Deployment not found", { status: 404 });
  }

  // Server deployment — proxy to running process
  const markerPath = join(deployDir, ".grob-server");
  if (existsSync(markerPath)) {
    return proxyRequest(_req, deploymentId, pathParts);
  }

  // Static file serving
  let filePath: string;
  if (pathParts.length === 0) {
    filePath = join(deployDir, "index.html");
    if (!existsSync(filePath)) {
      const items = readdirSync(deployDir).filter(
        (f) => f !== "." && f !== ".." && !f.startsWith(".") && f !== "node_modules",
      );
      if (items.length === 1) {
        const candidate = join(deployDir, items[0]);
        if (lstatSync(candidate).isDirectory()) {
          const nestedIndex = join(candidate, "index.html");
          if (existsSync(nestedIndex)) {
            filePath = nestedIndex;
          } else {
            filePath = join(deployDir, items[0], pathParts.join("/"));
          }
        } else {
          filePath = candidate;
        }
      } else if (items.includes("index.html")) {
        filePath = join(deployDir, "index.html");
      } else {
        filePath = join(deployDir, pathParts.join("/"));
      }
    }
  } else {
    filePath = join(deployDir, ...pathParts);
  }

  if (!existsSync(filePath) || lstatSync(filePath).isDirectory()) {
    const dirIndex = join(filePath, "index.html");
    if (existsSync(dirIndex)) {
      filePath = dirIndex;
    } else {
      return new Response("File not found", { status: 404 });
    }
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const content = readFileSync(filePath);
  return new Response(content, {
    headers: { "Content-Type": contentType },
  });
}

export async function POST(req: Request, props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return new Response("Not found", { status: 404 });
  const [deploymentId, ...pathParts] = slug;
  return proxyRequest(req, deploymentId, pathParts);
}

export async function PUT(req: Request, props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return new Response("Not found", { status: 404 });
  const [deploymentId, ...pathParts] = slug;
  return proxyRequest(req, deploymentId, pathParts);
}

export async function DELETE(req: Request, props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return new Response("Not found", { status: 404 });
  const [deploymentId, ...pathParts] = slug;
  return proxyRequest(req, deploymentId, pathParts);
}

export async function PATCH(req: Request, props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params;
  if (!slug || slug.length === 0) return new Response("Not found", { status: 404 });
  const [deploymentId, ...pathParts] = slug;
  return proxyRequest(req, deploymentId, pathParts);
}
