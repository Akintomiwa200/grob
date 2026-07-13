import { readFileSync, existsSync, lstatSync, readdirSync } from "fs";
import { join, extname } from "path";
import { execa } from "execa";
import { prisma } from "@/lib/prisma";
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

function isSubdomainRequest(req: Request): boolean {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  return host.endsWith(".localhost") || host.endsWith(".grob.app");
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

  let startArgs = interpolatePort(marker.startArgs, port);
  const startCmd = marker.startCmd;

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

function rewriteHtmlPaths(html: string, basePath: string): string {
  const prefix = basePath.slice(1);
  let result = html.replace(
    /((?:href|src|content)=["'])\/([^"']*)/g,
    (match, attr: string, path: string) => {
      if (path.startsWith(prefix + "/")) return match;
      return `${attr}${basePath}/${path}`;
    },
  );
  result = result.replace(
    /("(\/_next\/[^"]*?)")/g,
    (match, full, path) => `"${basePath}${path}"`,
  );
  return result;
}

function resolveFilePath(deployDir: string, pathParts: string[]): string | null {
  let filePath: string;

  if (pathParts.length === 0) {
    // For the root path, check Next.js server/app first
    let baseDir = deployDir;
    const nextAppDir = join(deployDir, "server", "app");
    if (existsSync(nextAppDir)) {
      baseDir = nextAppDir;
    }

    filePath = join(baseDir, "index.html");
    if (!existsSync(filePath)) {
      const items = readdirSync(baseDir).filter(
        (f) => f !== "." && f !== ".." && !f.startsWith(".") && f !== "node_modules",
      );
      if (items.length === 1) {
        const candidate = join(baseDir, items[0]);
        if (lstatSync(candidate).isDirectory()) {
          const nestedIndex = join(candidate, "index.html");
          if (existsSync(nestedIndex)) {
            filePath = nestedIndex;
          } else {
            filePath = join(baseDir, items[0], "index.html");
          }
        } else {
          filePath = candidate;
        }
      } else if (items.includes("index.html")) {
        filePath = join(baseDir, "index.html");
      } else {
        return null;
      }
    }
  } else {
    // Map _next/static/* -> static/* and _next/build/* -> build/*
    let resolvedParts = pathParts;
    if (pathParts[0] === "_next" && pathParts.length >= 2) {
      const subdir = pathParts[1];
      const candidate = join(deployDir, subdir, ...pathParts.slice(2));
      if (existsSync(candidate)) {
        resolvedParts = [subdir, ...pathParts.slice(2)];
      }
    }
    filePath = join(deployDir, ...resolvedParts);
  }

  if (!existsSync(filePath)) return null;
  if (lstatSync(filePath).isDirectory()) {
    const dirIndex = join(filePath, "index.html");
    if (existsSync(dirIndex)) {
      filePath = dirIndex;
    } else {
      return null;
    }
  }

  return filePath;
}

function serveStatic(deployDir: string, pathParts: string[], slug: string): Response {
  const filePath = resolveFilePath(deployDir, pathParts);
  if (!filePath) return new Response("Not found", { status: 404 });

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const content = readFileSync(filePath);

  if (ext === ".html" || ext === ".rsc") {
    const rewritten = rewriteHtmlPaths(content.toString("utf-8"), `/p/${slug}`);
    return new Response(rewritten, {
      headers: { "Content-Type": contentType },
    });
  }

  return new Response(content, {
    headers: { "Content-Type": contentType },
  });
}

function notFound(): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Not Found | Grob</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0B0E14;color:#E7E9EE;font-family:Inter,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .wrap{text-align:center;padding:48px}
    .code{font-size:72px;font-weight:700;color:#6E5BFF;margin-bottom:16px}
    h1{font-size:24px;margin-bottom:8px}
    p{color:#8B92A4;font-size:15px}
    a{color:#6E5BFF;text-decoration:none}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="code">404</div>
    <h1>Project not found</h1>
    <p>This project doesn't exist or hasn't been deployed yet.</p>
    <p style="margin-top:24px"><a href="/">Go to Grob</a></p>
  </div>
</body>
</html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function resolveSlug(
  slug: string,
): Promise<{ deploymentId: string; projectId: string } | { redirect: string } | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!project) return null;

  const deployment = await prisma.deployment.findFirst({
    where: { projectId: project.id, status: "success" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (deployment) {
    return { deploymentId: deployment.id, projectId: project.id };
  }

  // No successful deployment yet — check for an in-progress one
  const latestDeployment = await prisma.deployment.findFirst({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });
  if (latestDeployment) {
    return {
      redirect: `/dashboard/projects/${project.id}/deployments/${latestDeployment.id}`,
    };
  }

  return null;
}

async function handleRequest(
  req: Request,
  slug: string,
  pathParts: string[],
): Promise<Response> {
  const resolved = await resolveSlug(slug);
  if (!resolved) return notFound();

  // Redirect to deployment detail if no successful deployment exists yet
  if ("redirect" in resolved) {
    const location = isSubdomainRequest(req)
      ? `http://localhost:3000${resolved.redirect}`
      : resolved.redirect;
    return new Response(null, {
      status: 302,
      headers: { Location: location },
    });
  }

  const deployDir = join(process.cwd(), "deployments-data", resolved.deploymentId);
  if (!existsSync(deployDir)) return notFound();

  const markerPath = join(deployDir, ".grob-server");
  if (existsSync(markerPath)) {
    let marker: { type?: string; startCmd?: string; startArgs?: string[] } | null = null;
    try {
      marker = JSON.parse(readFileSync(markerPath, "utf-8"));
    } catch {}

    const isNextJsStatic = marker?.type === "nextjs" || existsSync(join(deployDir, "server", "app"));
    if (!isNextJsStatic) {
      return proxyRequest(req, resolved.deploymentId, pathParts);
    }
  }

  // For Next.js static builds, also try server/app/{path}.html for sub-routes
  const nextAppDir = join(deployDir, "server", "app");
  if (pathParts.length > 0 && existsSync(nextAppDir)) {
    const subPageFile = join(nextAppDir, ...pathParts) + ".html";
    if (existsSync(subPageFile)) {
      const contentType = MIME[".html"];
      const content = readFileSync(subPageFile).toString("utf-8");
      return new Response(rewriteHtmlPaths(content, `/p/${slug}`), {
        headers: { "Content-Type": contentType },
      });
    }
  }

  return serveStatic(deployDir, pathParts, slug);
}

export async function GET(
  req: Request,
  props: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const params = await props.params;
  return handleRequest(req, params.slug, params.path || []);
}

export async function POST(
  req: Request,
  props: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const params = await props.params;
  return handleRequest(req, params.slug, params.path || []);
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const params = await props.params;
  return handleRequest(req, params.slug, params.path || []);
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const params = await props.params;
  return handleRequest(req, params.slug, params.path || []);
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const params = await props.params;
  return handleRequest(req, params.slug, params.path || []);
}
