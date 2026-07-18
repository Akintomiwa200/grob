import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Cable, ArrowLeft, CheckCircle2, Clock, Trash2, Copy, Shield, Server, Activity } from "lucide-react";
import Link from "next/link";

export default async function ConnectDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/connect" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Connect
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">Connection</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/10 text-muted">Not configured</span>
            </div>
            <p className="text-muted text-sm mt-1">Set up a database, cache, or network connection.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Connection Info</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Host</label>
              <input placeholder="db.example.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Port</label>
              <input placeholder="5432" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Connection String</label>
              <input type="password" placeholder="postgresql://user:password@host:5432/db" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Connection</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Environment Variables</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface/30 border border-border">
              <p className="text-xs text-muted mb-1">DATABASE_URL</p>
              <p className="text-xs font-mono text-text truncate">—</p>
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
