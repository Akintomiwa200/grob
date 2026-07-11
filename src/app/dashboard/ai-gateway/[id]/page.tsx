import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Share2, ArrowLeft, Zap, Shield, BarChart3, Clock, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function AIGatewayDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/ai-gateway" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to AI Gateway
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text font-mono">endpoint-{id.slice(0, 6)}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Active</span>
            </div>
            <p className="text-muted text-sm mt-1">AI Gateway endpoint configuration.</p>
          </div>
          <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Requests Today</p><p className="text-2xl font-bold text-text">0</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Cache Hit Rate</p><p className="text-2xl font-bold text-emerald-500">—</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Avg Latency</p><p className="text-2xl font-bold text-text">—</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Cost Today</p><p className="text-2xl font-bold text-text">$0.00</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">General</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-text mb-1">Endpoint Name</label><input defaultValue={`endpoint-${id.slice(0, 6)}`} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
            <div><label className="block text-sm font-medium text-text mb-1">Model</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>GPT-4o</option><option>Claude 3.5 Sonnet</option><option>Gemini Pro</option><option>Llama 3.1 70B</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-text mb-1">API Key</label>
              <div className="flex items-center gap-2"><input type="password" defaultValue="sk-grob-xxxxx" className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /><button className="p-2 border border-border rounded-lg hover:bg-white/[0.05] transition-colors"><Eye className="h-4 w-4 text-muted" /></button></div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Rate Limiting</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-text mb-1">Requests per Minute</label><input defaultValue="60" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
            <div><label className="block text-sm font-medium text-text mb-1">Tokens per Minute</label><input defaultValue="100000" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
            <div><label className="block text-sm font-medium text-text mb-1">Burst Limit</label><input defaultValue="10" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <h2 className="text-lg font-semibold text-text mb-4">Caching</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface/30 border border-border">
            <span className="text-sm text-text">Enable Cache</span>
            <button className="w-11 h-6 rounded-full bg-accent"><div className="w-5 h-5 rounded-full bg-white translate-x-5.5" /></button>
          </div>
          <div><label className="block text-xs text-muted mb-1">Cache TTL (seconds)</label><input defaultValue="300" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" /></div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface/30 border border-border">
            <span className="text-sm text-text">Stale-while-revalidate</span>
            <button className="w-11 h-6 rounded-full bg-border"><div className="w-5 h-5 rounded-full bg-white translate-x-0.5" /></button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30"><h2 className="font-semibold text-text">Request Logs</h2></div>
        <div className="px-6 py-16 text-center">
          <Clock className="h-6 w-6 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No requests logged yet.</p>
        </div>
      </div>
    </div>
  );
}
