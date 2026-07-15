import { readFileSync, existsSync, lstatSync, readdirSync, writeFileSync } from "fs";
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
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wasm": "application/wasm",
  ".csv": "text/csv; charset=utf-8",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

const TEXT_EXTS = new Set([
  ".html", ".css", ".js", ".mjs", ".json", ".svg", ".txt", ".xml",
  ".ts", ".tsx", ".jsx", ".md", ".yaml", ".yml", ".toml", ".map",
]);

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
  const envFile = join(/*turbopackIgnore: true*/ deployDir, ".env");
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
  return join(/*turbopackIgnore: true*/ deployDir, marker.startCwd);
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
  const markerPath = join(/*turbopackIgnore: true*/ deployDir, ".grob-server");
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

  let startCmd = marker.startCmd;
  let startArgs = [...marker.startArgs];

  const isNextjs = marker.type === "nextjs";

  if (isNextjs && startCmd === "npx" && startArgs[0] === "serve") {
    const nextBin = join(/*turbopackIgnore: true*/ deployDir, "node_modules", ".bin", "next");
    const nextExe = join(/*turbopackIgnore: true*/ deployDir, "node_modules", ".bin", "next.cmd");
    if (existsSync(/*turbopackIgnore: true*/ nextBin) || existsSync(/*turbopackIgnore: true*/ nextExe)) {
      startCmd = nextExe;
      startArgs = ["start", "-p", String(port)];
    } else {
      startCmd = "npx";
      startArgs = ["next", "start", "-p", String(port)];
    }
  }

  if (startCmd === "npx" && startArgs[0] === "serve" && !isNextjs) {
    startArgs = ["serve", deployDir, "-l", String(port)];
  }

  if (startCmd === "npx" && startArgs[0] === "next" && startArgs[1] === "start") {
    const nextBin = join(/*turbopackIgnore: true*/ deployDir, "node_modules", ".bin", "next");
    const nextExe = join(/*turbopackIgnore: true*/ deployDir, "node_modules", ".bin", "next.cmd");
    if (existsSync(/*turbopackIgnore: true*/ nextBin) || existsSync(/*turbopackIgnore: true*/ nextExe)) {
      startCmd = nextExe;
      startArgs = ["start", "-p", String(port)];
    } else {
      startCmd = "npx";
      startArgs = ["next", "start", "-p", String(port)];
    }
  }

  const runtimeEnv = loadEnvFile(deployDir);
  const cwd = resolveStartCwd(marker, deployDir);
  const env = { ...process.env, ...runtimeEnv, PORT: String(port), NODE_ENV: "production" };

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

    const isNextServer = marker.type === "nextjs" || (marker.startArgs?.[0] === "next" && marker.startArgs?.[1] === "start");
    const timeoutMs = isNextServer ? 20000 : ["java", "dotnet", "cargo", "go", "cabal", "mix", "bundle"].includes(startCmd) ? 30000 : 15000;
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
  const deployDir = join(/*turbopackIgnore: true*/ process.cwd(), "deployments-data", deploymentId);
  if (!existsSync(/*turbopackIgnore: true*/ deployDir)) {
    return new Response("Deployment not found", { status: 404 });
  }

  const markerPath = join(/*turbopackIgnore: true*/ deployDir, ".grob-server");
  if (!existsSync(/*turbopackIgnore: true*/ markerPath)) {
    return new Response("Not a server deployment", { status: 404 });
  }

  const { port, ready } = await getOrCreateServer(deploymentId, deployDir);
  if (!ready || port <= 0) {
    return new Response("Server not ready", { status: 503 });
  }

  const targetPath = pathParts.length > 0 ? "/" + pathParts.join("/") : "/";
  const search = req.url.includes("?") ? req.url.split("?")[1] : "";
  const targetUrl = search ? `${targetPath}?${search}` : targetPath;

  try {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (key !== "host") headers.set(key, value);
    });
    headers.set("x-forwarded-host", req.headers.get("host") || "");
    headers.set("host", `127.0.0.1:${port}`);

    const proxyRes = await fetch(`http://127.0.0.1:${port}${targetUrl}`, {
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
  const prefix = basePath.slice(1) + "/";

  let result = html;

  result = result.replace(
    /((?:href|src|content|poster|action|cite|data|formaction|icon|manifest|archive)=["'])\/((?!\/)[^"']*)/g,
    (match, attr: string, path: string) => {
      if (path.startsWith(prefix)) return match;
      return `${attr}${basePath}/${path}`;
    },
  );

  result = result.replace(
    /(srcset=["'])((?!data:)[^"']*)/g,
    (match, attr: string, value: string) => {
      const rewritten = value.replace(
        /(?:^|,\s*)(\/(?!data:)[^\s,]+)/g,
        (m: string, url: string) => {
          if (url.startsWith(basePath)) return m;
          return m.replace(url, `${basePath}${url}`);
        },
      );
      return `${attr}${rewritten}`;
    },
  );

  result = result.replace(
    /("(\/_next\/[^"]*?)")/g,
    (match, full, path) => `"${basePath}${path}"`,
  );

  result = result.replace(
    /('\/_next\/[^']*?')/g,
    (match) => {
      const path = match.slice(1, -1);
      return `'${basePath}${path}'`;
    },
  );

  return result;
}

function rewriteCssPaths(css: string, basePath: string): string {
  const prefix = basePath.slice(1) + "/";

  return css.replace(
    /url\((["']?)\/(?!data:)([^"')]+)\1\)/g,
    (match, quote: string, path: string) => {
      if (path.startsWith(prefix)) return match;
      return `url(${quote}${basePath}/${path}${quote})`;
    },
  );
}

function rewriteJsPaths(js: string, basePath: string): string {
  const prefix = basePath.slice(1) + "/";

  let result = js;

  result = result.replace(
    /((?:import|export)\s+.*?from\s+["'])\/((?!\/)[^"']+)/g,
    (match, prefix_match: string, path: string) => {
      if (path.startsWith(prefix)) return match;
      return `${prefix_match}${basePath}/${path}`;
    },
  );

  result = result.replace(
    /(import\s*\(\s*["'])\/((?!\/)[^"']+)/g,
    (match, prefix_match: string, path: string) => {
      if (path.startsWith(prefix)) return match;
      return `${prefix_match}${basePath}/${path}`;
    },
  );

  result = result.replace(
    /(["'])\/_next\/([^"']+)\1/g,
    (match, quote: string, path: string) => {
      return `${quote}${basePath}/_next/${path}${quote}`;
    },
  );

  return result;
}

function rewriteSvgPaths(svg: string, basePath: string): string {
  const prefix = basePath.slice(1) + "/";

  return svg.replace(
    /(xlink:href|href)=["']\/(?!data:)([^"']+)/g,
    (match, attr: string, path: string) => {
      if (path.startsWith(prefix)) return match;
      return `${attr}="${basePath}/${path}"`;
    },
  );
}

function debugLog(msg: string) {
  console.error(`[GROB-DEBUG ${new Date().toISOString()}] ${msg}`);
}

function resolveFilePath(deployDir: string, pathParts: string[], isSpa: boolean): { file: string | null; isIndexFallback: boolean } {
  let filePath: string | null = null;
  const pathStr = pathParts.join("/");

  function spaFallback(): { file: string | null; isIndexFallback: boolean } {
    if (isSpa) {
      const fallback = findIndexHtml(deployDir);
      debugLog(`spaFallback: fallback=${fallback}`);
      if (fallback) return { file: fallback, isIndexFallback: true };
    }
    debugLog(`spaFallback: returning null`);
    return { file: null, isIndexFallback: false };
  }

  if (pathParts.length === 0) {
    let baseDir = deployDir;
    const nextAppDir = join(/*turbopackIgnore: true*/ deployDir, "server", "app");
    const nextAppDirNew = join(/*turbopackIgnore: true*/ deployDir, ".next", "server", "app");
    if (existsSync(nextAppDir)) {
      baseDir = nextAppDir;
    } else if (existsSync(nextAppDirNew)) {
      baseDir = nextAppDirNew;
    }

    filePath = join(/*turbopackIgnore: true*/ baseDir, "index.html");
    if (!existsSync(/*turbopackIgnore: true*/ filePath)) {
      const items = readdirSync(baseDir).filter(
        (f) => f !== "." && f !== ".." && !f.startsWith(".") && f !== "node_modules",
      );
      if (items.length === 1) {
        const candidate = join(/*turbopackIgnore: true*/ baseDir, items[0]);
        if (lstatSync(candidate).isDirectory()) {
          const nestedIndex = join(/*turbopackIgnore: true*/ candidate, "index.html");
          if (existsSync(nestedIndex)) {
            filePath = nestedIndex;
          } else {
            filePath = join(/*turbopackIgnore: true*/ baseDir, items[0], "index.html");
          }
        } else {
          filePath = candidate;
        }
      } else if (items.includes("index.html")) {
        filePath = join(/*turbopackIgnore: true*/ baseDir, "index.html");
      } else {
        return spaFallback();
      }
    }
  } else {
    let resolvedParts = pathParts;

    if (pathParts[0] === "_next" && pathParts.length >= 2) {
      const nextMapped = join(/*turbopackIgnore: true*/ deployDir, ".next", ...pathParts.slice(1));
      const directAccess = join(/*turbopackIgnore: true*/ deployDir, "_next", ...pathParts.slice(1));
      debugLog(`_next mapping: path="${pathStr}" nextMapped="${nextMapped}" exists=${existsSync(nextMapped)} directAccess="${directAccess}" exists=${existsSync(directAccess)}`);
      if (existsSync(nextMapped)) {
        filePath = nextMapped;
        resolvedParts = [".next", ...pathParts.slice(1)];
      } else if (existsSync(directAccess)) {
        filePath = directAccess;
        resolvedParts = ["_next", ...pathParts.slice(1)];
      } else {
        const subdir = pathParts[1];
        const candidate = join(/*turbopackIgnore: true*/ deployDir, subdir, ...pathParts.slice(2));
        debugLog(`_next fallback: subdir="${subdir}" candidate="${candidate}" exists=${existsSync(candidate)}`);
        if (existsSync(candidate)) {
          resolvedParts = [subdir, ...pathParts.slice(2)];
        }
      }
    }

    if (!filePath) {
      filePath = join(/*turbopackIgnore: true*/ deployDir, ...resolvedParts);
    }

    if (!existsSync(filePath)) {
      const nextCandidate = join(/*turbopackIgnore: true*/ deployDir, ".next", ...resolvedParts.filter((p) => p !== ".next" && p !== "_next"));
      if (existsSync(nextCandidate)) {
        filePath = nextCandidate;
      }
    }

    if (!existsSync(filePath)) {
      const publicCandidate = join(/*turbopackIgnore: true*/ deployDir, "public", ...resolvedParts);
      if (existsSync(publicCandidate)) {
        filePath = publicCandidate;
      }
    }

    if (!existsSync(filePath)) {
      const nextServerAppDir = join(/*turbopackIgnore: true*/ deployDir, ".next", "server", "app");
      if (existsSync(/*turbopackIgnore: true*/ nextServerAppDir)) {
        const nextAppHtml = join(/*turbopackIgnore: true*/ nextServerAppDir, ...resolvedParts) + ".html";
        if (existsSync(/*turbopackIgnore: true*/ nextAppHtml)) {
          filePath = nextAppHtml;
        } else {
          const nextAppIndex = join(/*turbopackIgnore: true*/ nextServerAppDir, ...resolvedParts, "index.html");
          if (existsSync(/*turbopackIgnore: true*/ nextAppIndex)) {
            filePath = nextAppIndex;
          }
        }
      }
    }
  }

  if (!filePath || !existsSync(filePath)) {
    debugLog(`resolveFilePath: NOT FOUND path="${pathStr}" finalPath="${filePath}"`);
    return spaFallback();
  }

  if (lstatSync(filePath).isDirectory()) {
    const dirIndex = join(/*turbopackIgnore: true*/ filePath, "index.html");
    if (existsSync(dirIndex)) {
      filePath = dirIndex;
    } else {
      return spaFallback();
    }
  }

  debugLog(`resolveFilePath: FOUND path="${pathStr}" file="${filePath}"`);
  return { file: filePath, isIndexFallback: false };
}

function findIndexHtml(deployDir: string): string | null {
  const candidates = [
    join(/*turbopackIgnore: true*/ deployDir, "index.html"),
    join(/*turbopackIgnore: true*/ deployDir, ".next", "server", "app", "index.html"),
    join(/*turbopackIgnore: true*/ deployDir, "server", "app", "index.html"),
    join(/*turbopackIgnore: true*/ deployDir, "public", "index.html"),
  ];

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }

  const appDir = join(/*turbopackIgnore: true*/ deployDir, ".next", "server", "app");
  if (existsSync(appDir)) {
    const items = readdirSync(appDir).filter((f) => f.endsWith(".html"));
    if (items.length === 1) return join(/*turbopackIgnore: true*/ appDir, items[0]);
  }

  return null;
}

function serveStatic(
  deployDir: string,
  pathParts: string[],
  slug: string,
  isSpa: boolean,
  basePath: string,
): Response {
  const pathStr = pathParts.join("/");
  debugLog(`serveStatic: path="${pathStr}" deployDir="${deployDir}" basePath="${basePath}"`);
  const { file: filePath, isIndexFallback } = resolveFilePath(deployDir, pathParts, isSpa);
  if (!filePath) { debugLog(`serveStatic: 404 path="${pathStr}"`); return new Response("Not found", { status: 404 }); }
  debugLog(`serveStatic: serving filePath="${filePath}" isIndexFallback=${isIndexFallback}`);

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const content = readFileSync(filePath);
  const isSubdomain = basePath === "/";

  if (ext === ".html" || ext === ".rsc") {
    let html = content.toString("utf-8");
    if (!isSubdomain) {
      html = rewriteHtmlPaths(html, basePath);
    }
    if (isIndexFallback) {
      const baseHref = isSubdomain ? "/" : `${basePath}/`;
      html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`);
    }
    return new Response(html, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });
  }

  if (ext === ".css") {
    const body = isSubdomain ? content.toString("utf-8") : rewriteCssPaths(content.toString("utf-8"), basePath);
    return new Response(body, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  if (ext === ".js" || ext === ".mjs") {
    const body = isSubdomain ? content.toString("utf-8") : rewriteJsPaths(content.toString("utf-8"), basePath);
    return new Response(body, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  if (ext === ".svg") {
    const body = isSubdomain ? content.toString("utf-8") : rewriteSvgPaths(content.toString("utf-8"), basePath);
    return new Response(body, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  return new Response(content, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    },
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

function detectSpa(deployDir: string): boolean {
  if (existsSync(join(/*turbopackIgnore: true*/ deployDir, ".grob-server"))) {
    try {
      const marker = JSON.parse(readFileSync(join(/*turbopackIgnore: true*/ deployDir, ".grob-server"), "utf-8"));
      if (marker.type === "static" || marker.type === "nextjs" || marker.type === "react" || marker.type === "vite") return true;
    } catch {}
  }

  if (existsSync(join(/*turbopackIgnore: true*/ deployDir, ".next", "server", "app"))) return true;
  if (existsSync(join(/*turbopackIgnore: true*/ deployDir, "build"))) return true;

  if (
    existsSync(join(/*turbopackIgnore: true*/ deployDir, "package.json"))
  ) {
    try {
      const pkg = JSON.parse(readFileSync(join(/*turbopackIgnore: true*/ deployDir, "package.json"), "utf-8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.react || deps.vue || deps.svelte || deps.angular || deps.solid || deps.next || deps.nuxt || deps.gatsby) {
        return true;
      }
    } catch {}
  }

  return false;
}

async function handleRequest(
  req: Request,
  slug: string,
  pathParts: string[],
): Promise<Response> {
  const host = req.headers.get("host") || "";
  const pathStr = pathParts.join("/");
  debugLog(`REQUEST host="${host}" slug="${slug}" path="${pathStr}" url="${req.url}"`);

  const resolved = await resolveSlug(slug);
  if (!resolved) { debugLog(`resolveSlug: NOT FOUND slug="${slug}"`); return notFound(); }

  if ("redirect" in resolved) {
    const location = isSubdomainRequest(req)
      ? `http://localhost:3000${resolved.redirect}`
      : resolved.redirect;
    return new Response(null, {
      status: 302,
      headers: { Location: location },
    });
  }

  const deployDir = join(/*turbopackIgnore: true*/ process.cwd(), "deployments-data", resolved.deploymentId);
  if (!existsSync(/*turbopackIgnore: true*/ deployDir)) { debugLog(`deployDir NOT EXISTS: ${deployDir}`); return notFound(); }

  const markerPath = join(/*turbopackIgnore: true*/ deployDir, ".grob-server");
  if (existsSync(markerPath)) {
    let marker: { type?: string; startCmd?: string; startArgs?: string[] } | null = null;
    try {
      marker = JSON.parse(readFileSync(markerPath, "utf-8"));
    } catch {}

    const isNextjs = marker?.type === "nextjs" || existsSync(/*turbopackIgnore: true*/ join(deployDir, ".next", "server", "app"));
    const isServeStatic = marker?.startCmd === "npx" && marker?.startArgs?.[0] === "serve" && !isNextjs;
    debugLog(`marker: type=${marker?.type} isNextjs=${isNextjs} startCmd=${marker?.startCmd} isServeStatic=${isServeStatic}`);

    if (!isNextjs && isServeStatic) {
      const isSpa = detectSpa(deployDir);
      const isSubdomain = isSubdomainRequest(req);
      const basePath = isSubdomain ? "/" : `/p/${slug}`;
      debugLog(`serveStatic: isSpa=${isSpa} isSubdomain=${isSubdomain} basePath="${basePath}"`);
      return serveStatic(deployDir, pathParts, slug, isSpa, basePath);
    }

    if (isNextjs) {
      const envFile = join(/*turbopackIgnore: true*/ deployDir, ".env");
      if (!existsSync(/*turbopackIgnore: true*/ envFile)) {
        try {
          const project = await prisma.project.findFirst({
            where: { deployments: { some: { id: resolved.deploymentId } } },
            select: { id: true },
          });
          if (project) {
            const envVars = await prisma.envVar.findMany({
              where: { projectId: project.id },
              select: { key: true, value: true },
            });
            if (envVars.length > 0) {
              const envContent = envVars.map((v) => `${v.key}=${v.value}`).join("\n") + "\n";
              writeFileSync(envFile, envContent, "utf-8");
              debugLog(`Wrote .env with ${envVars.length} vars`);
            }
          }
        } catch (e) {
          debugLog(`Failed to write .env: ${e}`);
        }
      }

      const isApiRoute = pathParts.length > 0 && pathParts[0] === "api";

      if (isApiRoute) {
        return proxyRequest(req, resolved.deploymentId, pathParts);
      }

      const isSubdomain = isSubdomainRequest(req);
      const basePath = isSubdomain ? "/" : `/p/${slug}`;
      const staticResult = serveStatic(deployDir, pathParts, slug, true, basePath);
      if (staticResult.status !== 404) {
        return staticResult;
      }

      return proxyRequest(req, resolved.deploymentId, pathParts);
    }

    return proxyRequest(req, resolved.deploymentId, pathParts);
  }

  const nextAppDir = join(/*turbopackIgnore: true*/ deployDir, "server", "app");
  const nextAppDirNew = join(/*turbopackIgnore: true*/ deployDir, ".next", "server", "app");
  const activeNextAppDir = existsSync(nextAppDir) ? nextAppDir : existsSync(nextAppDirNew) ? nextAppDirNew : null;
  if (pathParts.length > 0 && activeNextAppDir) {
    const subPageFile = join(/*turbopackIgnore: true*/ activeNextAppDir, ...pathParts) + ".html";
    if (existsSync(subPageFile)) {
      const contentType = MIME[".html"];
      const content = readFileSync(subPageFile).toString("utf-8");
      const isSubdomain2 = isSubdomainRequest(req);
      const html = isSubdomain2 ? content : rewriteHtmlPaths(content, `/p/${slug}`);
      return new Response(html, {
        headers: { "Content-Type": contentType, "Cache-Control": "no-cache" },
      });
    }

    const subPageRsc = join(/*turbopackIgnore: true*/ activeNextAppDir, ...pathParts) + ".rsc";
    if (existsSync(subPageRsc)) {
      const content = readFileSync(subPageRsc).toString("utf-8");
      return new Response(content, {
        headers: { "Content-Type": "text/x-component; charset=utf-8", "Cache-Control": "no-cache" },
      });
    }
  }

  const isSpa = detectSpa(deployDir);
  const isSubdomain = isSubdomainRequest(req);
  const basePath = isSubdomain ? "/" : `/p/${slug}`;
  return serveStatic(deployDir, pathParts, slug, isSpa, basePath);
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
