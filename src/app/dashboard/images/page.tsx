"use client";

import { useState } from "react";
import {
  Images,
  Upload,
  Search,
  Image,
  Trash2,
  Download,
  Settings,
  Zap,
  Globe2,
  Clock,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Eye,
} from "lucide-react";

type OptimizedImage = {
  id: string;
  name: string;
  originalSize: string;
  optimizedSize: string;
  savings: string;
  dimensions: string;
  format: string;
  lastAccessed: string;
  url: string;
};

export default function ImagesPage() {
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Images Optimized", value: "1,247", change: "+84", icon: Image, color: "text-accent", bg: "bg-accent/10" },
    { label: "Bandwidth Saved", value: "4.2 GB", change: "+320 MB", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Transformations (30d)", value: "8,941", change: "+1,240", icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Cache Hit Rate", value: "97.2%", change: "+0.8%", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const images: OptimizedImage[] = [
    { id: "1", name: "hero-banner.webp", originalSize: "2.4 MB", optimizedSize: "180 KB", savings: "92%", dimensions: "1920×1080", format: "WebP", lastAccessed: "2 hours ago", url: "/images/hero-banner" },
    { id: "2", name: "product-photo.jpg", originalSize: "3.1 MB", optimizedSize: "245 KB", savings: "92%", dimensions: "800×600", format: "WebP", lastAccessed: "5 hours ago", url: "/images/product-photo" },
    { id: "3", name: "avatar-default.png", originalSize: "48 KB", optimizedSize: "12 KB", savings: "75%", dimensions: "128×128", format: "WebP", lastAccessed: "1 day ago", url: "/images/avatar-default" },
    { id: "4", name: "og-image.png", originalSize: "1.8 MB", optimizedSize: "320 KB", savings: "82%", dimensions: "1200×630", format: "WebP", lastAccessed: "2 days ago", url: "/images/og-image" },
    { id: "5", name: "background-pattern.svg", originalSize: "12 KB", optimizedSize: "8 KB", savings: "33%", dimensions: "Vector", format: "SVG", lastAccessed: "3 days ago", url: "/images/bg-pattern" },
    { id: "6", name: "team-photo.jpg", originalSize: "4.2 MB", optimizedSize: "380 KB", savings: "91%", dimensions: "2400×1600", format: "WebP", lastAccessed: "1 week ago", url: "/images/team-photo" },
  ];

  const filtered = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-text">Images</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Beta
            </span>
          </div>
          <p className="text-muted text-sm">
            Automatic image optimization with on-the-fly resizing, format conversion, and CDN delivery.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Upload className="h-4 w-4" /> Upload Images
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-3 w-3" /> {stat.change}
                </span>
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
        </div>
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
            {filtered.map((img) => (
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
                <td className="px-6 py-3 hidden md:table-cell text-xs text-muted">{img.dimensions}</td>
                <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted">{img.originalSize}</td>
                <td className="px-6 py-3 hidden sm:table-cell text-xs text-emerald-500 font-medium">
                  {img.optimizedSize}
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {img.savings}
                  </span>
                </td>
                <td className="px-6 py-3 hidden md:table-cell text-xs text-muted">{img.format}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
