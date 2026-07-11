import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Flag, ArrowLeft, ToggleLeft, ToggleRight, Users, Percent, BarChart3, Trash2, Copy } from "lucide-react";
import Link from "next/link";

export default async function FlagDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const flag = {
    id,
    name: `feature_${id.slice(0, 8)}`,
    description: "Feature flag for progressive rollout",
    enabled: true,
    rollout: 50,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/flags" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Feature Flags
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text font-mono">{flag.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${flag.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted/10 text-muted"}`}>
                {flag.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-muted text-sm mt-1">{flag.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors flex items-center gap-1.5">
              <Copy className="h-4 w-4" /> Duplicate
            </button>
            <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Status</p>
          <p className={`text-sm font-medium ${flag.enabled ? "text-emerald-500" : "text-muted"}`}>{flag.enabled ? "Active" : "Inactive"}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Rollout</p>
          <p className="text-sm font-medium text-text">{flag.rollout}%</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Impressions</p>
          <p className="text-sm font-medium text-text">0</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Created</p>
          <p className="text-sm font-medium text-text">{new Date(flag.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Flag Key</label>
              <div className="flex items-center gap-2">
                <input defaultValue={flag.name} className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
                <button className="p-2 border border-border rounded-lg hover:bg-white/[0.05] transition-colors"><Copy className="h-4 w-4 text-muted" /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Description</label>
              <textarea defaultValue={flag.description} rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Default Value</label>
              <select defaultValue="true" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Changes</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Targeting</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Rollout Percentage</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${flag.rollout}%` }} />
                </div>
                <span className="text-sm font-medium text-text w-12 text-right">{flag.rollout}%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Target Users</label>
              <div className="p-4 rounded-lg border border-dashed border-border text-center">
                <Users className="h-6 w-6 text-muted mx-auto mb-2" />
                <p className="text-xs text-muted">No user segments configured</p>
                <button className="mt-2 text-xs text-accent hover:text-accent/80 transition-colors">+ Add segment</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Override Rules</label>
              <div className="p-4 rounded-lg border border-dashed border-border text-center">
                <p className="text-xs text-muted">No override rules</p>
                <button className="mt-2 text-xs text-accent hover:text-accent/80 transition-colors">+ Add rule</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Usage History</h2>
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 14 }, (_, i) => {
            const h = Math.floor(Math.random() * 80) + 20;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-accent/20 border border-accent/30" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-muted">{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
