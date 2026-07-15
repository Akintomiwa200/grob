"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Zap,
  Key,
  Globe2,
  Activity,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  createAiRoute,
  deleteAiRoute,
  createAiKey,
  deleteAiKey,
} from "@/lib/ai-gateway-actions";

type Route = {
  id: string;
  projectId: string;
  name: string;
  path: string;
  model: string;
  provider: string;
  rateLimit: number;
  enabled: boolean;
  cacheTtl: number;
  _count: { logs: number };
};

type ApiKey = {
  id: string;
  name: string;
  key: string;
  active: boolean;
  lastUsed: string | null;
  createdAt: string;
};

type Stats = {
  totalRequests24h: number;
  avgLatency: number;
  routeCount: number;
  keyCount: number;
  byModel: Record<string, number>;
  byProvider: Record<string, number>;
};

const MODELS = [
  { model: "gpt-4o", provider: "OpenAI" },
  { model: "gpt-4o-mini", provider: "OpenAI" },
  { model: "text-embedding-3-small", provider: "OpenAI" },
  { model: "claude-3-haiku", provider: "Anthropic" },
  { model: "claude-3-sonnet", provider: "Anthropic" },
  { model: "claude-3-opus", provider: "Anthropic" },
  { model: "gemini-pro", provider: "Google" },
  { model: "llama-3-70b", provider: "Meta" },
];

export function AiGatewayClient({
  initialRoutes,
  initialKeys,
  stats,
}: {
  initialRoutes: Route[];
  initialKeys: ApiKey[];
  stats: Stats;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"routes" | "keys" | "analytics">("routes");
  const [routes, setRoutes] = useState(initialRoutes);
  const [keys, setKeys] = useState(initialKeys);
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRoutePath, setNewRoutePath] = useState("");
  const [newRouteModel, setNewRouteModel] = useState("gpt-4o");
  const [newRouteRate, setNewRouteRate] = useState("1000");
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  async function handleCreateRoute() {
    if (!newRouteName || !newRoutePath || !routes[0]) return;
    const m = MODELS.find((x) => x.model === newRouteModel) || MODELS[0];
    await createAiRoute(routes[0].projectId, {
      name: newRouteName,
      path: newRoutePath,
      model: newRouteModel,
      provider: m.provider,
      rateLimit: parseInt(newRouteRate) || 1000,
    });
    setShowNewRoute(false);
    setNewRouteName("");
    setNewRoutePath("");
    router.refresh();
  }

  async function handleDeleteRoute(id: string) {
    await deleteAiRoute(id);
    setRoutes((r) => r.filter((x) => x.id !== id));
  }

  async function handleCreateKey() {
    if (!newKeyName || !routes[0]) return;
    const k = await createAiKey(routes[0].projectId, newKeyName);
    if (k) setKeys((prev) => [{ ...k, createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : String(k.createdAt), lastUsed: k.lastUsed ? (k.lastUsed instanceof Date ? k.lastUsed.toISOString() : String(k.lastUsed)) : null }, ...prev]);
    setShowNewKey(false);
    setNewKeyName("");
  }

  async function handleDeleteKey(id: string) {
    await deleteAiKey(id);
    setKeys((k) => k.filter((x) => x.id !== id));
  }

  function maskKey(key: string) {
    if (key.length <= 20) return key;
    return key.slice(0, 12) + "..." + key.slice(-4);
  }

  const totalReq = stats.totalRequests24h || routes.reduce((s, r) => s + r._count.logs, 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Requests (24h)", value: totalReq.toLocaleString(), icon: Activity, color: "text-accent", bg: "bg-accent/10" },
          { label: "Avg. Latency", value: stats.avgLatency ? `${stats.avgLatency}ms` : "—", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Active Routes", value: routes.filter((r) => r.enabled).length.toString(), icon: Globe2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "API Keys", value: keys.length.toString(), icon: Key, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat) => {
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
        {(["routes", "keys", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${
              tab === t
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "routes" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewRoute((s) => !s)}
              className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> New Route
            </button>
          </div>

          {showNewRoute && (
            <div className="rounded-xl border border-border bg-surface/20 p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  placeholder="Route name"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <input
                  placeholder="/api/ai/chat"
                  value={newRoutePath}
                  onChange={(e) => setNewRoutePath(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <select
                  value={newRouteModel}
                  onChange={(e) => setNewRouteModel(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  {MODELS.map((m) => (
                    <option key={m.model} value={m.model}>
                      {m.model} ({m.provider})
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Rate limit (req/min)"
                  type="number"
                  value={newRouteRate}
                  onChange={(e) => setNewRouteRate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateRoute}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Create Route
                </button>
                <button
                  onClick={() => setShowNewRoute(false)}
                  className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {routes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Globe2 className="h-8 w-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No routes configured yet</p>
              <p className="text-xs text-muted/60 mt-1">Create a route to start proxying AI requests</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/50 text-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium">Route</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Model</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Provider</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Requests</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Rate Limit</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {routes.map((route) => (
                    <tr key={route.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3">
                        <div>
                          <code className="text-xs font-mono text-accent">{route.path}</code>
                          <p className="text-[10px] text-muted mt-0.5">{route.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell text-xs text-text font-mono">{route.model}</td>
                      <td className="px-6 py-3 hidden md:table-cell text-xs text-muted">{route.provider}</td>
                      <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted">{route._count.logs.toLocaleString()}</td>
                      <td className="px-6 py-3 hidden sm:table-cell text-xs text-muted font-mono">{route.rateLimit.toLocaleString()}/min</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${route.enabled ? "bg-emerald-500" : "bg-zinc-500"}`} />
                          <span className="text-xs text-muted">{route.enabled ? "Active" : "Disabled"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "keys" && (
        <div className="space-y-4">
          {keys.map((apiKey) => (
            <div key={apiKey.id} className="rounded-xl border border-border bg-surface/20 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="h-4 w-4 text-muted" />
                    <h3 className="font-semibold text-text">{apiKey.name}</h3>
                    {!apiKey.active && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-muted">
                      {revealedKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() =>
                        setRevealedKeys((r) => ({ ...r, [apiKey.id]: !r[apiKey.id] }))
                      }
                      className="p-1 rounded text-muted hover:text-text transition-colors"
                    >
                      {revealedKeys[apiKey.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(apiKey.key)}
                      className="p-1 rounded text-muted hover:text-text transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                    <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    {apiKey.lastUsed && (
                      <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {showNewKey ? (
            <div className="rounded-xl border border-border bg-surface/20 p-5 space-y-3">
              <input
                placeholder="Key name (e.g. Production)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent text-text focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateKey}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Generate
                </button>
                <button
                  onClick={() => setShowNewKey(false)}
                  className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewKey(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-accent border border-accent/30 rounded-xl hover:bg-accent/5 transition-colors"
            >
              <Plus className="h-4 w-4" /> Generate New Key
            </button>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-surface/20 p-6">
            <h3 className="font-semibold text-text mb-4">Requests by Model</h3>
            <div className="space-y-4">
              {Object.entries(stats.byModel).length === 0 ? (
                <p className="text-sm text-muted">No request data yet</p>
              ) : (
                Object.entries(stats.byModel)
                  .sort((a, b) => b[1] - a[1])
                  .map(([model, count]) => {
                    const total = Object.values(stats.byModel).reduce((s, v) => s + v, 0);
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={model}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono text-text">{model}</span>
                          <span className="text-xs text-muted">{count.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent/60 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/20 p-6">
            <h3 className="font-semibold text-text mb-4">Requests by Provider</h3>
            <div className="space-y-4">
              {Object.entries(stats.byProvider).length === 0 ? (
                <p className="text-sm text-muted">No request data yet</p>
              ) : (
                Object.entries(stats.byProvider)
                  .sort((a, b) => b[1] - a[1])
                  .map(([provider, count]) => {
                    const total = Object.values(stats.byProvider).reduce((s, v) => s + v, 0);
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];
                    const color = colors[Object.keys(stats.byProvider).indexOf(provider) % colors.length];
                    return (
                      <div key={provider}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-text">{provider}</span>
                          <span className="text-xs text-muted">{count.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
