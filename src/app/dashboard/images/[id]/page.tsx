import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Image, Download, Copy } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ImageDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const image = await prisma.optimizedImage.findFirst({
    where: { id, project: { userId: session.user.id } },
  });
  if (!image) notFound();

  const savings = image.originalSize
    ? Math.round(
        ((image.originalSize - image.optimizedSize) / image.originalSize) * 100
      )
    : 0;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link
          href="/dashboard/images"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Image Optimization
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text font-mono">
              {image.name}
            </h1>
            <p className="text-muted text-sm mt-1">
              {image.width}×{image.height} · {image.originalFormat.toUpperCase()} →{" "}
              {image.format.toUpperCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors flex items-center gap-1.5">
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Dimensions</p>
          <p className="text-sm font-medium text-text">
            {image.width} × {image.height}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Original Size</p>
          <p className="text-sm font-medium text-text">{formatBytes(image.originalSize)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Format</p>
          <p className="text-sm font-medium text-text uppercase">{image.format}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Optimized</p>
          <p className="text-sm font-medium text-emerald-500">
            {formatBytes(image.optimizedSize)} ({savings}% saved)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Preview</h2>
          <div className="aspect-video rounded-lg bg-surface/50 border border-border flex items-center justify-center">
            <div className="text-center">
              <Image className="h-12 w-12 text-muted mx-auto mb-2" />
              <p className="text-xs text-muted">{image.name}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 p-3 rounded-lg bg-surface/30 border border-border text-center">
              <p className="text-xs text-muted">Original</p>
              <p className="text-sm font-medium text-text">
                {formatBytes(image.originalSize)}
              </p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
              <p className="text-xs text-emerald-500">Optimized</p>
              <p className="text-sm font-medium text-emerald-500">
                {formatBytes(image.optimizedSize)}
              </p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-accent/5 border border-accent/20 text-center">
              <p className="text-xs text-accent">Savings</p>
              <p className="text-sm font-medium text-accent">{savings}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Transformations</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">Resize</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Width"
                  defaultValue={image.width}
                  className="px-2 py-1 border border-border rounded text-xs font-mono bg-transparent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  placeholder="Height"
                  defaultValue={image.height}
                  className="px-2 py-1 border border-border rounded text-xs font-mono bg-transparent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">Format</span>
              </div>
              <select className="w-full px-2 py-1 border border-border rounded text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-accent">
                <option>WebP</option>
                <option>AVIF</option>
                <option>JPEG</option>
                <option>PNG</option>
                <option>Keep original</option>
              </select>
            </div>
            <div className="p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">Quality</span>
                <span className="text-xs text-muted">80%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                defaultValue="80"
                className="w-full accent-accent mt-2"
              />
            </div>
            <button className="w-full py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
              Apply Transformations
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">CDN URLs</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/30 border border-border">
            <span className="text-xs text-muted w-16 shrink-0">Original</span>
            <code className="flex-1 text-xs font-mono text-text truncate">
              https://cdn.grob.dev{image.url}/original.{image.originalFormat}
            </code>
            <button className="p-1 rounded hover:bg-white/[0.05]">
              <Copy className="h-3.5 w-3.5 text-muted" />
            </button>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/30 border border-border">
            <span className="text-xs text-accent w-16 shrink-0">WebP</span>
            <code className="flex-1 text-xs font-mono text-text truncate">
              https://cdn.grob.dev{image.url}/optimized.webp
            </code>
            <button className="p-1 rounded hover:bg-white/[0.05]">
              <Copy className="h-3.5 w-3.5 text-muted" />
            </button>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/30 border border-border">
            <span className="text-xs text-emerald-500 w-16 shrink-0">AVIF</span>
            <code className="flex-1 text-xs font-mono text-text truncate">
              https://cdn.grob.dev{image.url}/optimized.avif
            </code>
            <button className="p-1 rounded hover:bg-white/[0.05]">
              <Copy className="h-3.5 w-3.5 text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
