import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldHalf, ArrowLeft, Trash2, Ban, Clock, Globe, Edit3 } from "lucide-react";
import Link from "next/link";

export default async function FirewallRuleDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/firewall" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Firewall
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text">Firewall Rule</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/10 text-muted">Not configured</span>
            </div>
            <p className="text-muted text-sm mt-1">This rule has not been set up yet.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Rule Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Rule Name</label>
              <input placeholder="e.g., Block SQL injection" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Action</label>
              <select defaultValue="block" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="block">Block</option>
                <option value="allow">Allow</option>
                <option value="rate-limit">Rate Limit</option>
                <option value="challenge">Challenge (JS)</option>
                <option value="captcha">CAPTCHA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Match Pattern</label>
              <input placeholder="/api/* or User-Agent pattern" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <p className="text-xs text-muted mt-1">Glob or regex pattern to match requests</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Apply To</label>
              <select defaultValue="all" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="all">All Requests</option>
                <option value="paths">Specific Paths</option>
                <option value="methods">HTTP Methods</option>
              </select>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Changes</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Rule Testing</h2>
          <p className="text-sm text-muted mb-4">Test this rule against sample requests</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Test IP</label>
              <input placeholder="192.168.1.1" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Test Path</label>
              <input placeholder="/api/users" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <button className="px-4 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors">Run Test</button>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-surface/30 border border-border">
            <p className="text-xs text-muted">Test results will appear here</p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-text mb-3">Recent Matches</h3>
            <div className="p-4 rounded-lg bg-surface/30 border border-border text-center">
              <p className="text-xs text-muted">No matches recorded yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
