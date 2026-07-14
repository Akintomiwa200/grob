"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Zap,
  HardDrive,
  MapPin,
  Trash2,
  Settings,
  Save,
  Plus,
  Loader2,
  X,
  Clock,
  CheckCircle2,
  Pencil,
} from "lucide-react";

interface CacheRule {
  id: string;
  ruleId: string;
  pattern: string;
  ttl: string;
  enabled: boolean;
}

interface EdgeConfig {
  minTtl: number;
  maxTtl: number;
  staleWhileRevalidate: number;
}

interface PurgeLog {
  id: string;
  path: string;
  status: string;
  createdAt: string;
}

interface CdnData {
  rules: CacheRule[];
  edgeConfig: EdgeConfig;
  purgeLogs: PurgeLog[];
  stats: { hitRatio: string; bandwidthSaved: string; edgeLocations: number };
}

export function CdnManager({
  projectId,
  initial,
}: {
  projectId: string;
  initial: CdnData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState(initial);

  const [edgeConfig, setEdgeConfig] = useState(initial.edgeConfig);
  const [edgeDirty, setEdgeDirty] = useState(false);

  const [purgePath, setPurgePath] = useState("");
  const [addingRule, setAddingRule] = useState(false);
  const [newRule, setNewRule] = useState({ ruleId: "", pattern: "", ttl: "60", enabled: true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ pattern: "", ttl: "" });

  async function act<T>(fn: () => Promise<T>): Promise<T | undefined> {
    let result: T | undefined;
    await startTransition(async () => {
      result = await fn();
      router.refresh();
    });
    return result;
  }

  async function toggleRule(rule: CacheRule) {
    const actions = await import("./actions");
    await act(() => actions.updateCacheRule(projectId, rule.id, { enabled: !rule.enabled }));
    setData((d) => ({
      ...d,
      rules: d.rules.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)),
    }));
  }

  async function handleAddRule() {
    if (!newRule.ruleId.trim() || !newRule.pattern.trim()) return;
    const actions = await import("./actions");
    await act(() => actions.createCacheRule(projectId, newRule));
    setAddingRule(false);
    setNewRule({ ruleId: "", pattern: "", ttl: "60", enabled: true });
    const updated = await actions.getCdnData(projectId);
    setData(updated);
  }

  async function handleDeleteRule(rule: CacheRule) {
    const actions = await import("./actions");
    await act(() => actions.deleteCacheRule(projectId, rule.id));
    setData((d) => ({ ...d, rules: d.rules.filter((r) => r.id !== rule.id) }));
  }

  async function saveRuleEdit(rule: CacheRule) {
    const actions = await import("./actions");
    await act(() =>
      actions.updateCacheRule(projectId, rule.id, {
        pattern: editDraft.pattern,
        ttl: editDraft.ttl,
      }),
    );
    setEditingId(null);
    setData((d) => ({
      ...d,
      rules: d.rules.map((r) =>
        r.id === rule.id ? { ...r, pattern: editDraft.pattern, ttl: editDraft.ttl } : r,
      ),
    }));
  }

  async function handlePurge(path: string) {
    const actions = await import("./actions");
    await act(() => actions.purgeCache(projectId, path));
    const updated = await actions.getCdnData(projectId);
    setData(updated);
    setPurgePath("");
  }

  async function handlePurgeAll() {
    const actions = await import("./actions");
    await act(() => actions.purgeCacheAll(projectId));
    const updated = await actions.getCdnData(projectId);
    setData(updated);
  }

  async function handleSaveEdge() {
    const actions = await import("./actions");
    await act(() =>
      actions.saveEdgeConfig(projectId, {
        minTtl: edgeConfig.minTtl,
        maxTtl: edgeConfig.maxTtl,
        staleWhileRevalidate: edgeConfig.staleWhileRevalidate,
      }),
    );
    setEdgeDirty(false);
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">CDN</h2>
        <p className="text-muted text-sm">
          Manage CDN and caching for this project
        </p>
      </div>

      {/* Cache Statistics */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Cache Statistics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Cache Hit Ratio", value: `${data.stats.hitRatio}%`, icon: Zap, color: "text-success" },
            { label: "Bandwidth Saved", value: data.stats.bandwidthSaved, icon: HardDrive, color: "text-info" },
            { label: "Edge Locations", value: String(data.stats.edgeLocations), icon: MapPin, color: "text-accent" },
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

      {/* Cache Rules */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-text">Cache Rules</h3>
          </div>
          <button
            type="button"
            onClick={() => setAddingRule(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_100px_60px_80px] gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
            <span>Path Pattern</span>
            <span>TTL</span>
            <span>Rule ID</span>
            <span className="text-right">On</span>
            <span />
          </div>

          {/* Add rule row */}
          {addingRule && (
            <div className="grid grid-cols-[1fr_100px_100px_60px_80px] gap-4 items-center px-5 py-3 border-b border-accent/30 bg-accent/[0.03]">
              <input
                value={newRule.pattern}
                onChange={(e) => setNewRule((r) => ({ ...r, pattern: e.target.value }))}
                placeholder="/*.html"
                className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <input
                value={newRule.ttl}
                onChange={(e) => setNewRule((r) => ({ ...r, ttl: e.target.value }))}
                placeholder="60"
                className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <input
                value={newRule.ruleId}
                onChange={(e) => setNewRule((r) => ({ ...r, ruleId: e.target.value }))}
                placeholder="my-rule"
                className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <div />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAddRule}
                  disabled={!newRule.ruleId.trim() || !newRule.pattern.trim()}
                  className="p-1.5 rounded-lg text-white bg-accent hover:opacity-90 disabled:opacity-40 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAddingRule(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Existing rules */}
          {data.rules.length === 0 && !addingRule ? (
            <div className="p-10 text-center">
              <p className="text-sm text-muted mb-1">No cache rules</p>
              <p className="text-xs text-muted/70">Add a rule to control caching behavior.</p>
            </div>
          ) : (
            data.rules.map((rule) => (
              <div
                key={rule.id}
                className="grid grid-cols-[1fr_100px_100px_60px_80px] gap-4 items-center px-5 py-4 border-b border-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                {editingId === rule.id ? (
                  <>
                    <input
                      value={editDraft.pattern}
                      onChange={(e) => setEditDraft((d) => ({ ...d, pattern: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                    <input
                      value={editDraft.ttl}
                      onChange={(e) => setEditDraft((d) => ({ ...d, ttl: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                    <span className="text-xs text-muted font-mono">{rule.ruleId}</span>
                    <div />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => saveRuleEdit(rule)}
                        className="p-1.5 rounded-lg text-white bg-accent hover:opacity-90 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <code className="text-sm font-mono text-text">{rule.pattern}</code>
                    <span className="text-sm text-muted">{rule.ttl}</span>
                    <span className="text-xs text-muted font-mono">{rule.ruleId}</span>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleRule(rule)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          rule.enabled ? "bg-success" : "bg-white/10"
                        }`}
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                          style={{ transform: rule.enabled ? "translateX(18px)" : "translateX(4px)" }}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(rule.id);
                          setEditDraft({ pattern: rule.pattern, ttl: rule.ttl });
                        }}
                        title="Edit"
                        className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Purge Cache */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Purge Cache</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <p className="text-xs text-muted">
            Invalidate cached assets across all edge locations. This may take up
            to 30 seconds to propagate globally.
          </p>
          <div className="flex items-center gap-3">
            <input
              value={purgePath}
              onChange={(e) => setPurgePath(e.target.value)}
              placeholder="Enter path to purge (e.g., /images/*, /api/cache)"
              className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm font-mono text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
            <button
              type="button"
              onClick={() => handlePurge(purgePath)}
              disabled={!purgePath.trim() || pending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Purge
            </button>
            <button
              type="button"
              onClick={handlePurgeAll}
              disabled={pending}
              className="px-5 py-2.5 text-sm font-medium text-error bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition"
            >
              Purge All
            </button>
          </div>

          {/* Recent purge logs */}
          {data.purgeLogs.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted font-medium mb-2 uppercase tracking-wider">Recent Purges</p>
              <div className="space-y-1">
                {data.purgeLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    <code className="font-mono text-text">{log.path}</code>
                    <span className="text-xs text-muted ml-auto">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Edge Configuration */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-text">Edge Configuration</h3>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Min TTL</label>
              <input
                type="number"
                value={edgeConfig.minTtl}
                onChange={(e) => {
                  setEdgeConfig((c) => ({ ...c, minTtl: Number(e.target.value) }));
                  setEdgeDirty(true);
                }}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Max TTL</label>
              <input
                type="number"
                value={edgeConfig.maxTtl}
                onChange={(e) => {
                  setEdgeConfig((c) => ({ ...c, maxTtl: Number(e.target.value) }));
                  setEdgeDirty(true);
                }}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Stale-While-Revalidate</label>
              <input
                type="number"
                value={edgeConfig.staleWhileRevalidate}
                onChange={(e) => {
                  setEdgeConfig((c) => ({ ...c, staleWhileRevalidate: Number(e.target.value) }));
                  setEdgeDirty(true);
                }}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
              />
            </div>
          </div>
          {edgeDirty && (
            <button
              type="button"
              onClick={handleSaveEdge}
              disabled={pending}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Edge Config
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
