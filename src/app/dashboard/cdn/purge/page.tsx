import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Trash2, CheckCircle2, RefreshCcw, Clock } from "lucide-react";
import Link from "next/link";

export default async function CDNPurgePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/cdn" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Edge Network
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-text">Purge Cache</h1>
        <p className="text-muted text-sm mt-1">Clear cached content from the edge network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Purge Options</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Purge Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface/30 cursor-pointer hover:border-accent/50 transition-colors">
                  <input type="radio" name="purgeType" value="selective" defaultChecked className="accent-accent" />
                  <div>
                    <p className="text-sm font-medium text-text">Selective Purge</p>
                    <p className="text-xs text-muted">Purge specific paths or patterns</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface/30 cursor-pointer hover:border-accent/50 transition-colors">
                  <input type="radio" name="purgeType" value="whole" className="accent-accent" />
                  <div>
                    <p className="text-sm font-medium text-text">Purge Everything</p>
                    <p className="text-xs text-muted">Clear all cached content globally</p>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Path Pattern</label>
              <input placeholder="/images/logo.png or /_next/static/*" className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <p className="text-xs text-muted mt-1">Use * as wildcard. Example: /images/* purges all images.</p>
            </div>
            <button className="w-full px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" /> Purge Cache
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Purge Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface/30 border border-border">
              <p className="text-sm font-medium text-text mb-1">Propagation Time</p>
              <p className="text-xs text-muted">Cache purge typically takes 5-30 seconds to propagate across all edge nodes.</p>
            </div>
            <div className="p-4 rounded-lg bg-surface/30 border border-border">
              <p className="text-sm font-medium text-text mb-1">Impact</p>
              <p className="text-xs text-muted">Purged content will be re-cached on the next request. This may temporarily increase origin load.</p>
            </div>
            <div className="p-4 rounded-lg bg-surface/30 border border-border">
              <p className="text-sm font-medium text-text mb-1">Rate Limit</p>
              <p className="text-xs text-muted">Maximum 100 purge requests per hour per project.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <h2 className="font-semibold text-text">Purge History</h2>
        </div>
        <div className="px-6 py-12 text-center">
          <Clock className="h-5 w-5 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No purges yet</p>
          <p className="text-xs text-muted mt-1">Purge history will appear here once you clear cached content.</p>
        </div>
      </div>
    </div>
  );
}
