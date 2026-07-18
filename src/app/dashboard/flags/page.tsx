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
  const [flags] = useState<FeatureFlag[]>([]);

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
          <p className="text-2xl font-bold text-text">0</p>
          <p className="text-xs text-muted mt-1">Total Flags</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ToggleRight className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">0</p>
          <p className="text-xs text-muted mt-1">Enabled</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text">—</p>
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

      <div className="rounded-xl border border-border bg-surface/20 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mx-auto mb-4">
          <Flag className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-text mb-1">No feature flags</h3>
        <p className="text-xs text-muted max-w-sm mx-auto mb-4">
          Create feature flags to toggle functionality and run gradual rollouts without deploying code.
        </p>
        <button className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all">
          <Plus className="h-4 w-4" /> Create Flag
        </button>
      </div>
    </div>
  );
}
