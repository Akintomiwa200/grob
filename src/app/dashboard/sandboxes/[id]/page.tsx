import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Box, Play, Terminal, Trash2, Settings, RotateCcw, Copy, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SandboxDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const sandbox = {
    id,
    name: `sandbox-${id.slice(0, 6)}`,
    runtime: "Node.js 20",
    status: "running",
    created: new Date(Date.now() - 30 * 60000).toISOString(),
    url: `https://sandbox-${id.slice(0, 6)}.grob.dev`,
    memory: "512 MB",
    cpu: "1 vCPU",
    disk: "1 GB",
  };

  const envVars = [
    { key: "NODE_ENV", value: "development" },
    { key: "PORT", value: "3000" },
  ];

  const logs = [
    "[2024-01-15 10:30:01] Sandbox started",
    "[2024-01-15 10:30:02] Runtime: Node.js 20.11.0",
    "[2024-01-15 10:30:03] Dependencies installed",
    "[2024-01-15 10:30:04] Server listening on port 3000",
    "[2024-01-15 10:30:05] Ready",
  ];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/sandboxes" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Sandboxes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text font-mono">{sandbox.name}</h1>
              <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Running
              </span>
            </div>
            <p className="text-muted text-sm mt-1">{sandbox.runtime} &middot; {sandbox.memory} &middot; {sandbox.cpu}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" /> Restart
            </button>
            <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" /> Stop
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Status</p>
          <p className="text-sm font-medium text-emerald-500">Running</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Runtime</p>
          <p className="text-sm font-medium text-text">{sandbox.runtime}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Memory</p>
          <p className="text-sm font-medium text-text">{sandbox.memory}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">URL</p>
          <a href={sandbox.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors font-mono truncate block">
            {sandbox.url.replace("https://", "")}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
            <h2 className="font-semibold text-text flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" /> Logs
            </h2>
            <button className="text-xs text-muted hover:text-text transition-colors">Copy</button>
          </div>
          <div className="p-4 bg-[#0B0E14] font-mono text-xs text-emerald-400 max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="py-0.5">{log}</div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
            <h2 className="font-semibold text-text">Environment Variables</h2>
            <button className="text-xs text-accent hover:text-accent/80 transition-colors">+ Add</button>
          </div>
          <div className="divide-y divide-border">
            {envVars.map((v) => (
              <div key={v.key} className="px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-mono text-text">{v.key}</span>
                <span className="text-sm text-muted font-mono">{v.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Settings</h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Name</label>
            <input defaultValue={sandbox.name} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Runtime</label>
            <select defaultValue="nodejs20" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
              <option value="nodejs20">Node.js 20</option>
              <option value="python311">Python 3.11</option>
              <option value="go121">Go 1.21</option>
            </select>
          </div>
          <div className="pt-4 border-t border-border">
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
