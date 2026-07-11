"use client";

import { useState } from "react";
import {
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  HardDrive,
  Zap,
  Server,
  ArrowUpRight,
  Search,
} from "lucide-react";

type CacheEntry = {
  url: string;
  region: string;
  size: string;
  hitRate: string;
  ttl: string;
};

export default function CDNPage() {
  const [purgeUrl, setPurgeUrl] = useState("");

  const stats = [
    {
      label: "Edge Requests (24h)",
      value: "184,291",
      icon: Zap,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Cache Hit Ratio",
      value: "94.2%",
      icon: HardDrive,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Bandwidth Saved",
      value: "2.4 TB",
      icon: Server,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Avg. TTL",
      value: "24h",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const edgeLocations = [
    { city: "San Francisco", requests: "42.1K", hitRate: "96.2%", latency: "4ms" },
    { city: "New York", requests: "38.7K", hitRate: "95.1%", latency: "5ms" },
    { city: "London", requests: "28.4K", hitRate: "93.8%", latency: "8ms" },
    { city: "Frankfurt", requests: "22.1K", hitRate: "94.5%", latency: "7ms" },
    { city: "Tokyo", requests: "18.9K", hitRate: "92.3%", latency: "12ms" },
    { city: "Sydney", requests: "14.2K", hitRate: "91.7%", latency: "14ms" },
    { city: "São Paulo", requests: "11.8K", hitRate: "90.4%", latency: "18ms" },
    { city: "Mumbai", requests: "8.1K", hitRate: "89.2%", latency: "22ms" },
  ];

  const cacheRules = [
    { pattern: "/_next/static/*", ttl: "1 year", immutable: true, staleWhileRevalidate: true },
    { pattern: "/images/*", ttl: "30 days", immutable: false, staleWhileRevalidate: true },
    { pattern: "/api/*", ttl: "0s (no-cache)", immutable: false, staleWhileRevalidate: false },
    { pattern: "/*.html", ttl: "1 hour", immutable: false, staleWhileRevalidate: true },
    { pattern: "/fonts/*", ttl: "365 days", immutable: true, staleWhileRevalidate: true },
  ];

  const recentPurges = [
    { url: "/images/banner-*", count: 12, time: "3 hours ago", status: "completed" },
    { url: "/_next/static/chunks/*", count: 48, time: "1 day ago", status: "completed" },
    { url: "/api/config", count: 1, time: "3 days ago", status: "completed" },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">CDN</h1>
        <p className="text-muted text-sm mt-1">
          Manage your edge network, caching rules, and content delivery.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="font-semibold text-text mb-4">Purge Cache</h2>
          <p className="text-sm text-muted mb-4">
            Instantly invalidate cached content at all edge locations.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="URL or pattern (e.g., /images/*)"
              value={purgeUrl}
              onChange={(e) => setPurgeUrl(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
              <RefreshCw className="h-4 w-4" /> Purge
            </button>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted mb-2">Recent Purges</p>
            <div className="space-y-2">
              {recentPurges.map((purge, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-text">{purge.url}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted">{purge.count} entries</span>
                    <span className="text-emerald-500">{purge.status}</span>
                    <span className="text-muted">{purge.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text">Cache Rules</h2>
            <button className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors">
              <Plus className="h-3 w-3" /> Add Rule
            </button>
          </div>
          <div className="space-y-3">
            {cacheRules.map((rule, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-accent">{rule.pattern}</code>
                  <span className="text-xs text-muted">TTL: {rule.ttl}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {rule.immutable && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-medium">
                      Immutable
                    </span>
                  )}
                  {rule.staleWhileRevalidate && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-medium">
                      Stale-While-Revalidate
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-text">Edge Locations</h2>
            <p className="text-xs text-muted mt-0.5">
              Request distribution across {edgeLocations.length} global PoPs
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Filter locations..."
              className="rounded-lg border border-border bg-surface/30 pl-8 pr-3 py-1.5 text-xs text-text placeholder-muted focus:border-accent focus:outline-none w-48"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Region</th>
              <th className="px-4 py-2 font-medium">Requests</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Hit Rate</th>
              <th className="px-4 py-2 font-medium hidden md:table-cell">Avg. Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {edgeLocations.map((loc) => (
              <tr key={loc.city} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted" />
                    <span className="font-medium text-text">{loc.city}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{loc.requests}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: loc.hitRate }}
                      />
                    </div>
                    <span className="text-xs text-emerald-500 font-medium">{loc.hitRate}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted font-mono">
                  {loc.latency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
