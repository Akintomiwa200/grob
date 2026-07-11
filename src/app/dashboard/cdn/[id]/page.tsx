import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Globe, ArrowLeft, Trash2, Edit3, Clock, CheckCircle2, HardDrive, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default async function CDNDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const rule = {
    id,
    path: id === "static" ? "/_next/static/*" : id === "images" ? "/images/*" : id === "api" ? "/api/*" : "/*.html",
    ttl: id === "static" ? "1 year" : id === "images" ? "30 days" : id === "api" ? "No cache" : "60 seconds",
    immutable: id === "static",
    status: "active",
    staleWhileRevalidate: id !== "api",
    bypassOnCookie: false,
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link href="/dashboard/cdn" className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Edge Network
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text font-mono">{rule.path}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Active</span>
            </div>
            <p className="text-muted text-sm mt-1">Cache rule configuration</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors flex items-center gap-1.5">
              <RefreshCcw className="h-4 w-4" /> Purge
            </button>
            <button className="px-3 py-2 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">TTL</p>
          <p className="text-sm font-medium text-text">{rule.ttl}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Immutable</p>
          <p className={`text-sm font-medium ${rule.immutable ? "text-emerald-500" : "text-muted"}`}>{rule.immutable ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Cache Hit Rate</p>
          <p className="text-sm font-medium text-emerald-500">—</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Requests Served</p>
          <p className="text-sm font-medium text-text">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Rule Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Path Pattern</label>
              <input defaultValue={rule.path} className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50" />
              <p className="text-xs text-muted mt-1">Glob pattern to match URLs (e.g., /images/*, *.css)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Cache TTL</label>
              <select defaultValue="1y" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="no-cache">No Cache</option>
                <option value="60s">60 seconds</option>
                <option value="5m">5 minutes</option>
                <option value="1h">1 hour</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="1y">1 year</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text">Immutable</label>
                <p className="text-xs text-muted">Never revalidate after initial cache</p>
              </div>
              <button className={`w-11 h-6 rounded-full transition-colors ${rule.immutable ? "bg-accent" : "bg-border"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${rule.immutable ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text">Stale While Revalidate</label>
                <p className="text-xs text-muted">Serve stale content while revalidating</p>
              </div>
              <button className={`w-11 h-6 rounded-full transition-colors ${rule.staleWhileRevalidate ? "bg-accent" : "bg-border"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${rule.staleWhileRevalidate ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">Save Changes</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/20 p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Cache Behavior</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-text">Response Headers</span>
              </div>
              <div className="font-mono text-xs text-muted space-y-1">
                <p>Cache-Control: {rule.immutable ? "public, max-age=31536000, immutable" : `public, max-age=${rule.ttl === "60 seconds" ? "60" : "86400"}`}</p>
                <p>CDN-Cache-Control: public</p>
                <p>Vary: Accept-Encoding</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-text">Cache Key</span>
              </div>
              <p className="font-mono text-xs text-muted">Method + URI + Accept-Encoding + cookies</p>
            </div>
            <div className="p-4 rounded-lg bg-surface/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-text">Last Purged</span>
              </div>
              <p className="text-xs text-muted">Never</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
