import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Cable, ArrowLeft, CheckCircle2, Clock, Trash2, Copy, Shield, Server, Activity } from "lucide-react";
import Link from "next/link";

const connectionData: Record<string, { name: string; type: string; host: string; port: string; latency: string; uptime: string }> = {
  "1": { name: "PostgreSQL (Managed)", type: "Database", host: "db-managed.grob.internal", port: "5432", latency: "2ms", uptime: "99.99%" },
  "2": { name: "Redis (Managed)", type: "Cache", host: "cache-managed.grob.internal", port: "6379", latency: "1ms", uptime: "99.99%" },
  "3": { name: "Private Network Tunnel", type: "VPN", host: "tunnel.grob.internal", port: "443", latency: "12ms", uptime: "99.95%" },
  "4": { name: "Custom TCP/UDP", type: "Network", host: "custom.grob.internal", port: "8080", latency: "8ms", uptime: "99.90%" },
};

export default async function ConnectDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const data = connectionData[id] || { name: `Connection ${id}`, type: "Unknown", host: "—", port: "—", latency: "—", uptime: "—" };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/connect" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Connect
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">{data.name}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Connected</span>
            </div>
            <p className="text-muted text-sm mt-1">{data.type} connection</p>
          </div>
          <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> Disconnect</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Status</p><p className="text-sm font-medium text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Latency</p><p className="text-sm font-medium text-text">{data.latency}</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Uptime</p><p className="text-sm font-medium text-emerald-500">{data.uptime}</p></div>
        <div className="rounded-xl border border-border bg-surface/20 p-4"><p className="text-xs text-muted mb-1">Type</p><p className="text-sm font-medium text-text">{data.type}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Connection Info</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2"><span className="text-sm text-muted">Host</span><span className="text-sm font-mono text-text">{data.host}</span></div>
            <div className="flex items-center justify-between py-2 border-t border-border"><span className="text-sm text-muted">Port</span><span className="text-sm font-mono text-text">{data.port}</span></div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-sm text-muted">Connection String</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted">••••••••</span>
                <button className="p-1 rounded hover:bg-white/[0.05]"><Copy className="h-3.5 w-3.5 text-muted" /></button>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border"><span className="text-sm text-muted">SSL</span><span className="text-sm font-medium text-emerald-500">Enabled</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Environment Variables</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface/30 border border-border">
              <p className="text-xs text-muted mb-1">DATABASE_URL</p>
              <p className="text-xs font-mono text-text truncate">postgresql://user:***@{data.host}:{data.port}/db</p>
            </div>
            <div className="p-3 rounded-lg bg-surface/30 border border-border">
              <p className="text-xs text-muted mb-1">DATABASE_SSL</p>
              <p className="text-xs font-mono text-text">true</p>
            </div>
          </div>
          <button className="mt-4 w-full py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors">+ Add Variable</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Access Control</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /><span className="text-sm text-text">IP Whitelist</span></div>
              <button className="text-xs text-accent hover:text-accent/80">Configure</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /><span className="text-sm text-text">VPC Peering</span></div>
              <button className="text-xs text-accent hover:text-accent/80">Configure</button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Activity Log</h2>
          <div className="p-8 rounded-lg border border-dashed border-border text-center">
            <Activity className="h-6 w-6 text-muted mx-auto mb-2" />
            <p className="text-xs text-muted">No recent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
