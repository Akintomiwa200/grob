"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Search,
  Image,
  Trash2,
  Copy,
  Zap,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { createImage, deleteImage } from "@/lib/image-actions";

type OptimizedImage = {
  id: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  format: string;
  originalFormat: string;
  url: string;
  createdAt: string;
};

type Stats = {
  totalCount: number;
  totalOriginal: number;
  totalOptimized: number;
  bandwidthSaved: number;
  avgReduction: number;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagesClient({
  initialImages,
  stats,
}: {
  initialImages: OptimizedImage[];
  stats: Stats;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadWidth, setUploadWidth] = useState("1920");
  const [uploadHeight, setUploadHeight] = useState("1080");
  const [uploadFormat, setUploadFormat] = useState("png");

  const filtered = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleUpload() {
    if (!uploadName) return;
    const mockSize = Math.round(500000 + Math.random() * 3000000);
    const img = await createImage(images[0] ? "" : "", {
      name: uploadName,
      url: `/images/${uploadName}`,
      originalSize: mockSize,
      width: parseInt(uploadWidth) || 1920,
      height: parseInt(uploadHeight) || 1080,
      originalFormat: uploadFormat,
    });
    if (img) {
      setImages((prev) => [
        {
          ...img,
          createdAt: img.createdAt.toISOString(),
        },
        ...prev,
      ]);
    }
    setShowUpload(false);
    setUploadName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteImage(id);
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(`https://cdn.grob.dev${url}`);
  }

  const savingsPercent = stats.totalOriginal
    ? Math.round(((stats.totalOriginal - stats.totalOptimized) / stats.totalOriginal) * 100)
    : 0;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Images Optimized",
            value: stats.totalCount.toLocaleString(),
            icon: Image,
            color: "text-accent",
            bg: "bg-accent/10",
          },
          {
            label: "Bandwidth Saved",
            value: formatBytes(stats.bandwidthSaved),
            icon: Zap,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Total Original",
            value: formatBytes(stats.totalOriginal),
            icon: RefreshCw,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Avg Reduction",
            value: stats.totalCount ? `${stats.avgReduction}%` : "—",
            icon: BarChart3,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
                {savingsPercent > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" /> {savingsPercent}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/20 p-6">
          <h3 className="font-semibold text-text mb-4">Transformation URL Builder</h3>
          <p className="text-sm text-muted mb-4">
            Generate optimized image URLs with width, height, quality, and format parameters.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Source Image URL</label>
              <input
                type="text"
                placeholder="https://your-domain.com/image.jpg"
                className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted mb-1.5 block">Width</label>
                <input
                  type="number"
                  placeholder="auto"
                  className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Height</label>
                <input
                  type="number"
                  placeholder="auto"
                  className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Quality</label>
                <input
                  type="number"
                  placeholder="80"
                  className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Output Format</label>
              <select className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none">
                <option>Auto (best format)</option>
                <option>WebP</option>
                <option>AVIF</option>
                <option>JPEG</option>
                <option>PNG</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h3 className="font-semibold text-text mb-4">Supported Formats</h3>
          <div className="space-y-3">
            {[
              { format: "Input", formats: "JPEG, PNG, WebP, AVIF, GIF, SVG" },
              { format: "Output", formats: "JPEG, PNG, WebP, AVIF" },
            ].map((f) => (
              <div key={f.format} className="py-2 border-b border-border last:border-0">
                <p className="text-xs text-muted mb-1">{f.format}</p>
                <p className="text-sm text-text">{f.formats}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
            <p className="text-xs text-emerald-500 font-medium">Automatic Format Negotiation</p>
            <p className="text-[11px] text-muted mt-0.5">
              Images are served in the optimal format based on the browser&apos;s Accept header.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between gap-4">
          <h2 className="font-semibold text-text">Optimized Images</h2>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface/30 pl-10 pr-3 py-1.5 text-xs text-text placeholder-muted focus:border-accent focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowUpload((s) => !s)}
              className="flex items-center gap-2 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="h-4 w-4" /> Upload
            </button>
          </div>
        </div>

        {showUpload && (
          <div className="px-6 py-4 border-b border-border bg-surface/10 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <input
                placeholder="Image name (e.g. hero.jpg)"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="col-span-2 px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <input
                placeholder="Width"
                type="number"
                value={uploadWidth}
                onChange={(e) => setUploadWidth(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <input
                placeholder="Height"
                type="number"
                value={uploadHeight}
                onChange={(e) => setUploadHeight(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <select
                value={uploadFormat}
                onChange={(e) => setUploadFormat(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
                <option value="svg">SVG</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
              >
                Add Image
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Dimensions</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">Original</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">Optimized</th>
              <th className="px-6 py-3 font-medium">Savings</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Format</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Image className="h-8 w-8 text-muted mx-auto mb-3" />
                  <p className="text-sm text-muted">
                    {search ? "No images match your search" : "No images uploaded yet"}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((img) => {
                const savings = img.originalSize
                  ? Math.round(((img.originalSize - img.optimizedSize) / img.originalSize) * 100)
                  : 0;
                return (
                  <tr key={img.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/5 border border-border flex items-center justify-center">
                          <Image className="h-5 w-5 text-muted" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text">{img.name}</span>
                          <p className="text-[10px] text-muted font-mono">{img.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell text-xs text-muted">
                      {img.width}×{img.height}
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted">
                      {formatBytes(img.originalSize)}
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell text-xs text-emerald-500 font-medium">
                      {formatBytes(img.optimizedSize)}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {savings}%
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell text-xs text-muted uppercase">
                      {img.format}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyUrl(img.url)}
                          className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
