"use client";

import { useState } from "react";
import { CheckCircle2, RotateCw, Database, Send, AlertTriangle } from "lucide-react";

interface NodePurgeStatus {
  region: string;
  code: string;
  status: "idle" | "purging" | "done";
}

export default function CachingPage() {
  const [purgePath, setPurgePath] = useState("/*");
  const [isPurging, setIsPurging] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<NodePurgeStatus[]>([
    { region: "Americas East (IAD)", code: "iad1", status: "idle" },
    { region: "Americas West (SJC)", code: "sjc1", status: "idle" },
    { region: "Europe Central (FRA)", code: "fra1", status: "idle" },
    { region: "Europe West (LHR)", code: "lhr1", status: "idle" },
    { region: "Asia Pacific (NRT)", code: "nrt1", status: "idle" },
    { region: "Asia Pacific (SIN)", code: "sin1", status: "idle" }
  ]);

  const executePurge = async () => {
    if (!purgePath.trim()) return;
    setIsPurging(true);

    // Set all to purging
    setNodeStatuses(prev => prev.map(item => ({ ...item, status: "purging" })));

    // Purge sequentially to show animated propagation
    for (let i = 0; i < nodeStatuses.length; i++) {
      await wait(300 + Math.random() * 200);
      setNodeStatuses(prev => prev.map((item, idx) => idx === i ? { ...item, status: "done" } : item));
    }

    setIsPurging(false);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Edge Network</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Edge Caching
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Grob caches build files and assets at edge routers to serve content instantly. Control cache lifetimes and trigger instant purges across our edge cluster nodes.
      </p>

      {/* Interactive Cache Purger */}
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-accent" /> CDN Cache Purge Console
      </h2>
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* Path Form */}
        <div className="border-b border-border bg-bg/40 p-5">
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Purge Directory / File Pattern</label>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-muted text-sm font-semibold">https://your-domain.com</span>
                <input
                  type="text"
                  placeholder="/*"
                  value={purgePath}
                  onChange={(e) => {
                    setPurgePath(e.target.value);
                    if (!isPurging) {
                      setNodeStatuses(prev => prev.map(n => ({ ...n, status: "idle" })));
                    }
                  }}
                  className="w-full bg-surface border border-border rounded-lg pl-[192px] pr-3.5 py-2 text-sm font-mono text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <button
              onClick={executePurge}
              disabled={isPurging || !purgePath.trim()}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 bg-accent text-white px-5 py-2 rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
            >
              <Send className="h-3.5 w-3.5" /> Purge Cache
            </button>
          </div>
        </div>

        {/* Global Propagation List */}
        <div className="p-5">
          <h3 className="font-bold text-sm text-text mb-3">Global Propagation Status:</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {nodeStatuses.map((node) => (
              <div key={node.code} className="flex items-center justify-between p-3 rounded-xl border border-border bg-bg/15 text-sm font-medium">
                <div>
                  <span className="block text-text font-bold text-xs sm:text-sm">{node.region}</span>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-wider">{node.code}</span>
                </div>

                <div className="text-xs font-bold">
                  {node.status === "idle" && (
                    <span className="text-muted/60">Idle</span>
                  )}
                  {node.status === "purging" && (
                    <span className="text-accent flex items-center gap-1">
                      <RotateCw className="h-3.5 w-3.5 animate-spin" /> purging...
                    </span>
                  )}
                  {node.status === "done" && (
                    <span className="text-success flex items-center gap-1">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" /> Invalidated
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {nodeStatuses.every(n => n.status === "done") && !isPurging && (
            <div className="mt-5 p-3.5 rounded-lg bg-success/5 border border-success/15 flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="font-semibold">Cache purged successfully! All new edge router requests will fetch fresh data from source builds.</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed">
        <h3 className="font-bold text-text mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-4.5 w-4.5 text-signal" /> Cache-Control Overrides
        </h3>
        <p className="text-muted">
          Edge routes evaluate standard <code className="bg-bg border border-border px-1 py-0.5 rounded text-accent font-semibold font-mono text-xs">Cache-Control</code> headers. We recommend setting <code className="bg-bg border border-border px-1.5 py-0.5 rounded text-accent font-semibold font-mono text-xs">s-maxage=31536000, stale-while-revalidate=86400</code> for optimum static delivery.
        </p>
      </div>
    </div>
  );
}
