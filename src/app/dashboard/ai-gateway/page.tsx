"use client";

import { useState } from "react";
import {
  Share2,
  Plus,
  Zap,
  BarChart3,
  Key,
  Globe2,
  Activity,
  CheckCircle2,
  Copy,
  ExternalLink,
  Settings,
  Trash2,
  Shield,
} from "lucide-react";

type GatewayRoute = {
  id: string;
  path: string;
  model: string;
  provider: string;
  requests24h: number;
  avgLatency: string;
  status: "active" | "degraded" | "offline";
};

type ApiKey = {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  requests: number;
};

export default function AIGatewayPage() {
  const [activeTab, setActiveTab] = useState<"routes" | "keys" | "analytics">("routes");

  const routes: GatewayRoute[] = [
    {
      id: "1",
      path: "/api/ai/chat",
      model: "gpt-4o",
      provider: "OpenAI",
      requests24h: 12480,
      avgLatency: "320ms",
      status: "active",
    },
    {
      id: "2",
      path: "/api/ai/embeddings",
      model: "text-embedding-3-small",
      provider: "OpenAI",
      requests24h: 8420,
      avgLatency: "85ms",
      status: "active",
    },
    {
      id: "3",
      path: "/api/ai/summarize",
      model: "claude-3-haiku",
      provider: "Anthropic",
      requests24h: 3210,
      avgLatency: "450ms",
      status: "active",
    },
    {
      id: "4",
      path: "/api/ai/code-review",
      model: "gpt-4o",
      provider: "OpenAI",
      requests24h: 892,
      avgLatency: "1.2s",
      status: "degraded",
    },
  ];

  const apiKeys: ApiKey[] = [
    {
      id: "1",
      name: "Production",
      key: "grob_sk_prod_a8f2...x9k2",
      created: "Jan 15, 2026",
      lastUsed: "2 hours ago",
      requests: 48291,
    },
    {
      id: "2",
      name: "Development",
      key: "grob_sk_dev_m3k1...p7j4",
      created: "Feb 3, 2026",
      lastUsed: "5 hours ago",
      requests: 12847,
    },
  ];

  const stats = [
    { label: "Total Requests (24h)", value: "25,002", icon: Activity, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg. Latency", value: "280ms", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Routes", value: routes.filter((r) => r.status === "active").length.toString(), icon: Globe2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Cost (30d)", value: "$124.80", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">AI Gateway</h1>
          <p className="text-muted text-sm mt-1">
            Route, manage, and monitor AI model requests through a unified API.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Plus className="h-4 w-4" /> New Route
        </button>
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

      <div className="flex items-center gap-2 mb-6 border-b border-border">
        {(["routes", "keys", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "routes" && (
        <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/50 text-muted">
              <tr>
                <th className="px-6 py-3 font-medium">Route</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Model</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Provider</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Requests</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Latency</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3">
                    <code className="text-xs font-mono text-accent">{route.path}</code>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell text-xs text-text font-mono">{route.model}</td>
                  <td className="px-6 py-3 hidden md:table-cell text-xs text-muted">{route.provider}</td>
                  <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted">
                    {route.requests24h.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted font-mono">{route.avgLatency}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          route.status === "active"
                            ? "bg-emerald-500"
                            : route.status === "degraded"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs capitalize text-muted">{route.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "keys" && (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="h-4 w-4 text-muted" />
                    <h3 className="font-semibold text-text">{apiKey.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-muted">
                      {apiKey.key}
                    </code>
                    <button className="p-1 rounded text-muted hover:text-text transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                    <span>Created: {apiKey.created}</span>
                    <span>Last used: {apiKey.lastUsed}</span>
                    <span>{apiKey.requests.toLocaleString()} requests</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                    <Shield className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-accent border border-accent/30 rounded-xl hover:bg-accent/5 transition-colors">
            <Plus className="h-4 w-4" /> Generate New Key
          </button>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-surface/20 p-6">
            <h3 className="font-semibold text-text mb-4">Requests by Model</h3>
            <div className="space-y-4">
              {[
                { model: "gpt-4o", requests: 13372, percentage: 53 },
                { model: "text-embedding-3-small", requests: 8420, percentage: 34 },
                { model: "claude-3-haiku", requests: 3210, percentage: 13 },
              ].map((m) => (
                <div key={m.model}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-text">{m.model}</span>
                    <span className="text-xs text-muted">{m.requests.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/20 p-6">
            <h3 className="font-semibold text-text mb-4">Requests by Provider</h3>
            <div className="space-y-4">
              {[
                { provider: "OpenAI", requests: 21792, percentage: 87, color: "bg-emerald-500" },
                { provider: "Anthropic", requests: 3210, percentage: 13, color: "bg-blue-500" },
              ].map((p) => (
                <div key={p.provider}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text">{p.provider}</span>
                    <span className="text-xs text-muted">{p.requests.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full`}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
