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

export default function CDNPage() {
  const [purgeUrl, setPurgeUrl] = useState("");

  const stats = [
    { label: "Edge Requests (24h)", value: "—", icon: Zap, color: "text-accent", bg: "bg-accent/10" },
    { label: "Cache Hit Ratio", value: "—", icon: HardDrive, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Bandwidth Saved", value: "—", icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Avg. TTL", value: "—", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
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
            <div className="text-center py-4">
              <Clock className="h-4 w-4 text-muted mx-auto mb-1" />
              <p className="text-xs text-muted">No recent purges</p>
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
          <div className="text-center py-8">
            <HardDrive className="h-5 w-5 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted mb-1">No cache rules configured</p>
            <p className="text-xs text-muted">Add rules to control caching behavior for different paths.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-text">Edge Locations</h2>
            <p className="text-xs text-muted mt-0.5">
              Request distribution across global PoPs
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
        <div className="text-center py-12">
          <Globe className="h-6 w-6 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No edge location data yet</p>
          <p className="text-xs text-muted mt-1">Deploy a project to start seeing edge request distribution.</p>
        </div>
      </div>
    </div>
  );
}
