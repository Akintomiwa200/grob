"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Image,
  Upload,
  Trash2,
  Globe,
  Smartphone,
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

export function ProjectImagesClient({
  projectId,
  images,
  stats,
}: {
  projectId: string;
  images: OptimizedImage[];
  stats: Stats;
}) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadWidth, setUploadWidth] = useState("1920");
  const [uploadHeight, setUploadHeight] = useState("1080");
  const [uploadFormat, setUploadFormat] = useState("png");

  async function handleUpload() {
    if (!uploadName) return;
    const mockSize = Math.round(500000 + Math.random() * 3000000);
    await createImage(projectId, {
      name: uploadName,
      url: `/images/${uploadName}`,
      originalSize: mockSize,
      width: parseInt(uploadWidth) || 1920,
      height: parseInt(uploadHeight) || 1080,
      originalFormat: uploadFormat,
    });
    setShowUpload(false);
    setUploadName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteImage(id);
    router.refresh();
  }

  const remotePatterns = [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "cdn.example.com" },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text mb-1">Images</h2>
          <p className="text-muted text-sm">Image optimization and management</p>
        </div>
        <button
          onClick={() => setShowUpload((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition"
        >
          <Upload className="w-4 h-4" /> Upload Image
        </button>
      </div>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Image className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Images</p>
            </div>
            <p className="text-2xl font-bold text-text">{stats.totalCount}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Bandwidth Saved</p>
            </div>
            <p className="text-2xl font-bold text-text">{formatBytes(stats.bandwidthSaved)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Avg Reduction</p>
            </div>
            <p className="text-2xl font-bold text-text">
              {stats.totalCount ? `${stats.avgReduction}%` : "—"}
            </p>
          </div>
        </div>
      </section>

      {showUpload && (
        <section className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text">Upload Image</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <input
              placeholder="Image name (e.g. hero.jpg)"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className="col-span-2 px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <input
              placeholder="Width"
              type="number"
              value={uploadWidth}
              onChange={(e) => setUploadWidth(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <input
              placeholder="Height"
              type="number"
              value={uploadHeight}
              onChange={(e) => setUploadHeight(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <select
              value={uploadFormat}
              onChange={(e) => setUploadFormat(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
            >
              Add Image
            </button>
            <button
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04]"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-base font-semibold text-text mb-4">Images</h3>
        {images.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center">
            <Image className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No images uploaded yet</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium hidden md:table-cell">Dimensions</th>
                  <th className="px-5 py-3 text-left text-xs font-medium hidden sm:table-cell">Original</th>
                  <th className="px-5 py-3 text-left text-xs font-medium hidden sm:table-cell">Optimized</th>
                  <th className="px-5 py-3 text-left text-xs font-medium">Savings</th>
                  <th className="px-5 py-3 text-right text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {images.map((img) => {
                  const savings = img.originalSize
                    ? Math.round(((img.originalSize - img.optimizedSize) / img.originalSize) * 100)
                    : 0;
                  return (
                    <tr key={img.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-muted" />
                          <span className="text-sm font-medium text-text">{img.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-xs text-muted">
                        {img.width}×{img.height}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-xs text-muted">
                        {formatBytes(img.originalSize)}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-xs text-emerald-500 font-medium">
                        {formatBytes(img.optimizedSize)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {savings}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Remote Patterns</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          <p className="text-xs text-muted">
            External image domains allowed for optimization.
          </p>
          {remotePatterns.map((pattern, i) => (
            <div key={i} className="flex items-center gap-3 bg-bg border border-border rounded-lg px-4 py-3">
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase">
                  {pattern.protocol}
                </span>
                <code className="text-xs font-mono text-text">{pattern.hostname}</code>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
