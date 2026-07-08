import { readFileSync, existsSync, lstatSync, readdirSync } from "fs";
import { join, extname } from "path";

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
};

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
    // Try looking for index.html as fallback
    return new Response("Deployment not found", { status: 404 });
  }

  let filePath: string;
  if (pathParts.length === 0) {
    filePath = join(deployDir, "index.html");
    if (!existsSync(filePath)) {
      const items = readdirSync(deployDir).filter(
        (f) => f !== "." && f !== "..",
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
