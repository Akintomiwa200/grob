"use client";

import { useState } from "react";
import {
  Flag,
  Plus,
  ToggleLeft,
  ToggleRight,
  Users,
  Percent,
  Trash2,
  Settings,
  Copy,
  Search,
} from "lucide-react";

type FeatureFlag = {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rollout: number;
  variant: "boolean" | "string" | "number";
  updatedAt: string;
};

export default function FlagsPage() {
  const [search, setSearch] = useState("");

  const flags: FeatureFlag[] = [
    {
      id: "1",
      name: "New Checkout Flow",
      key: "new-checkout",
      description: "Enable the redesigned checkout experience for all users.",
      enabled: true,
      rollout: 100,
      variant: "boolean",
      updatedAt: "2 hours ago",
    },
    {
      id: "2",
      name: "Dark Mode",
      key: "dark-mode",
      description: "Toggle dark mode support across the application.",
      enabled: true,
      rollout: 75,
      variant: "boolean",
      updatedAt: "1 day ago",
    },
    {
      id: "3",
      name: "Pricing Experiment",
      key: "pricing-experiment",
      description: "A/B test for new pricing page layout and copy.",
      enabled: false,
      rollout: 50,
      variant: "string",
      updatedAt: "3 days ago",
    },
    {
      id: "4",
      name: "AI Search",
      key: "ai-search",
      description: "Enable AI-powered search results and suggestions.",
      enabled: true,
      rollout: 25,
      variant: "boolean",
      updatedAt: "5 days ago",
    },
    {
      id: "5",
      name: "Max Upload Size",
      key: "max-upload-size",
      description: "Override the maximum file upload size for beta users.",
      enabled: false,
      rollout: 10,
      variant: "number",
      updatedAt: "1 week ago",
    },
  ];

  const filtered = flags.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Feature Flags</h1>
          <p className="text-muted text-sm mt-1">
            Manage feature toggles and gradual rollouts without deploying code.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] self-start">
          <Plus className="h-4 w-4" /> New Flag
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Flag className="h-5 w-5 text-accent" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{flags.length}</p>
          <p className="text-xs text-muted mt-1">Total Flags</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ToggleRight className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{flags.filter((f) => f.enabled).length}</p>
          <p className="text-xs text-muted mt-1">Enabled</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">89%</p>
          <p className="text-xs text-muted mt-1">Avg. Coverage</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search flags by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface/30 pl-10 pr-4 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((flag) => (
          <div
            key={flag.id}
            className="rounded-xl border border-border bg-surface/20 p-5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${flag.enabled ? "bg-emerald-500/10" : "bg-white/5"}`}>
                  <Flag className={`h-5 w-5 ${flag.enabled ? "text-emerald-500" : "text-muted"}`} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text">{flag.name}</h3>
                    <code className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-muted">
                      {flag.key}
                    </code>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-medium capitalize">
                      {flag.variant}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">{flag.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-3 w-3 text-muted" />
                      <span className="text-xs text-muted">
                        Rollout: <span className="text-text font-medium">{flag.rollout}%</span>
                      </span>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${flag.enabled ? "bg-accent" : "bg-muted/30"}`}
                          style={{ width: `${flag.rollout}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted">Updated {flag.updatedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface/30 rounded-2xl">
          <Flag className="h-8 w-8 text-muted mb-3" />
          <p className="text-sm text-muted">No feature flags found.</p>
        </div>
      )}
    </div>
  );
}
