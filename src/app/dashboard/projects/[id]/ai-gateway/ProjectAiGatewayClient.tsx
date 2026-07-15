"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  Key,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Globe2,
} from "lucide-react";
import {
  createAiRoute,
  deleteAiRoute,
  createAiKey,
  deleteAiKey,
} from "@/lib/ai-gateway-actions";

type Route = {
  id: string;
  name: string;
  path: string;
  model: string;
  provider: string;
  rateLimit: number;
  enabled: boolean;
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
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
};

const MODELS = [
  { model: "gpt-4o", provider: "OpenAI" },
  { model: "gpt-4o-mini", provider: "OpenAI" },
  { model: "claude-3-haiku", provider: "Anthropic" },
  { model: "claude-3-sonnet", provider: "Anthropic" },
  { model: "gemini-pro", provider: "Google" },
  { model: "llama-3-70b", provider: "Meta" },
];

export function ProjectAiGatewayClient({
  projectId,
  routes,
  keys,
  stats,
}: {
  projectId: string;
  routes: Route[];
  keys: ApiKey[];
  stats: Stats;
}) {
  const router = useRouter();
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRoutePath, setNewRoutePath] = useState("");
  const [newRouteModel, setNewRouteModel] = useState("gpt-4o");
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  async function handleCreateRoute() {
    if (!newRouteName || !newRoutePath) return;
    const m = MODELS.find((x) => x.model === newRouteModel) || MODELS[0];
    await createAiRoute(projectId, {
      name: newRouteName,
      path: newRoutePath,
      model: newRouteModel,
      provider: m.provider,
    });
    setShowNewRoute(false);
    setNewRouteName("");
    setNewRoutePath("");
    router.refresh();
  }

  async function handleDeleteRoute(id: string) {
    await deleteAiRoute(id);
    router.refresh();
  }

  async function handleCreateKey() {
    if (!newKeyName) return;
    await createAiKey(projectId, newKeyName);
    setShowNewKey(false);
    setNewKeyName("");
    router.refresh();
  }

  async function handleDeleteKey(id: string) {
    await deleteAiKey(id);
    router.refresh();
  }

  function maskKey(key: string) {
    if (key.length <= 20) return key;
    return key.slice(0, 12) + "****" + key.slice(-4);
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">AI Gateway</h2>
        <p className="text-muted text-sm">
          Manage AI model routes and API keys
        </p>
      </div>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Requests", value: stats.totalRequests.toLocaleString(), icon: Activity, color: "text-accent" },
            { label: "Avg Latency", value: stats.avgLatency ? `${stats.avgLatency}ms` : "—", icon: Clock, color: "text-emerald-500" },
            { label: "Routes", value: routes.length.toString(), icon: Globe2, color: "text-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">Routes</h3>
          <button
            onClick={() => setShowNewRoute((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Route
          </button>
        </div>

        {showNewRoute && (
          <div className="bg-surface border border-border rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Route name" value={newRouteName} onChange={(e) => setNewRouteName(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <input placeholder="/api/ai/chat" value={newRoutePath} onChange={(e) => setNewRoutePath(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm font-mono bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <select value={newRouteModel} onChange={(e) => setNewRouteModel(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50">
                {MODELS.map((m) => (
                  <option key={m.model} value={m.model}>{m.model} ({m.provider})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateRoute} className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90">Create</button>
              <button onClick={() => setShowNewRoute(false)} className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04]">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {routes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Globe2 className="h-8 w-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No routes configured</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium">Route</th>
                  <th className="px-5 py-3 text-left text-xs font-medium hidden md:table-cell">Model</th>
                  <th className="px-5 py-3 text-left text-xs font-medium hidden sm:table-cell">Requests</th>
                  <th className="px-5 py-3 text-left text-xs font-medium">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-accent">{route.path}</code>
                      <p className="text-[10px] text-muted mt-0.5">{route.name}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-xs font-mono text-text">{route.model}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-xs text-muted">{route._count.logs}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${route.enabled ? "bg-emerald-500" : "bg-zinc-500"}`} />
                        <span className="text-xs text-muted">{route.enabled ? "Active" : "Off"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDeleteRoute(route.id)} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">API Keys</h3>
          <button
            onClick={() => setShowNewKey((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
          >
            <Key className="w-4 h-4" /> Generate Key
          </button>
        </div>

        {showNewKey && (
          <div className="bg-surface border border-border rounded-xl p-4 mb-3 space-y-3">
            <input placeholder="Key name (e.g. Production)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/50" />
            <div className="flex gap-2">
              <button onClick={handleCreateKey} className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90">Generate</button>
              <button onClick={() => setShowNewKey(false)} className="px-4 py-2 text-sm font-medium text-muted border border-border rounded-lg hover:bg-white/[0.04]">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
          {keys.length === 0 ? (
            <p className="text-sm text-muted">No API keys yet</p>
          ) : (
            keys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Key className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-text">{apiKey.name}</span>
                    <code className="text-xs text-muted font-mono ml-2">
                      {revealedKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setRevealedKeys((r) => ({ ...r, [apiKey.id]: !r[apiKey.id] }))} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.05]">
                    {revealedKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(apiKey.key)} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.05]">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteKey(apiKey.id)} className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
