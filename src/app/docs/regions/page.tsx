"use client";

import { useState } from "react";
import { Activity, Network, CheckCircle2, RotateCcw } from "lucide-react";

interface EdgeNode {
  id: string;
  city: string;
  country: string;
  code: string;
  latency: number | null;
  status: "idle" | "testing" | "green" | "yellow" | "red";
}

export default function RegionsPage() {
  const [nodes, setNodes] = useState<EdgeNode[]>([
    { id: "us-east", city: "Washington D.C.", country: "United States", code: "iad1", latency: null, status: "idle" },
    { id: "us-west", city: "San Jose", country: "United States", code: "sjc1", latency: null, status: "idle" },
    { id: "eu-central", city: "Frankfurt", country: "Germany", code: "fra1", latency: null, status: "idle" },
    { id: "eu-west", city: "London", country: "United Kingdom", code: "lhr1", latency: null, status: "idle" },
    { id: "ap-east", city: "Tokyo", country: "Japan", code: "nrt1", latency: null, status: "idle" },
    { id: "ap-south", city: "Singapore", country: "Singapore", code: "sin1", latency: null, status: "idle" },
    { id: "sa-east", city: "São Paulo", country: "Brazil", code: "gru1", latency: null, status: "idle" },
    { id: "oc-east", city: "Sydney", country: "Australia", code: "syd1", latency: null, status: "idle" }
  ]);
  const [isTesting, setIsTesting] = useState(false);

  const runPingTest = async () => {
    setIsTesting(true);
    
    // Set all to testing
    setNodes(prev => prev.map(n => ({ ...n, status: "testing", latency: null })));

    // Test nodes sequentially with staggered latency
    for (let i = 0; i < nodes.length; i++) {
      await wait(180 + Math.random() * 120);
      
      setNodes(prev => prev.map((node, index) => {
        if (index === i) {
          // Generate realistic latency
          let baseLatency = 10;
          if (node.id.startsWith("us")) baseLatency = 12 + Math.random() * 15;
          else if (node.id.startsWith("eu")) baseLatency = 75 + Math.random() * 25;
          else if (node.id.startsWith("ap")) baseLatency = 110 + Math.random() * 30;
          else if (node.id.startsWith("sa")) baseLatency = 135 + Math.random() * 35;
          else if (node.id.startsWith("oc")) baseLatency = 180 + Math.random() * 40;

          const latencyInt = Math.round(baseLatency);
          let statusColor: EdgeNode["status"] = "green";
          if (latencyInt > 150) statusColor = "red";
          else if (latencyInt > 80) statusColor = "yellow";

          return { ...node, latency: latencyInt, status: statusColor };
        }
        return node;
      }));
    }

    setIsTesting(false);
  };

  const resetPings = () => {
    setNodes(prev => prev.map(n => ({ ...n, latency: null, status: "idle" })));
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Edge Network</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Global Regions
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Grob serves static files, redirects, and edge middleware from a globally coordinated network router. We inspect incoming requests to serve assets from the nearest node.
      </p>

      {/* Latency checker */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent animate-pulse" /> Edge Latency Diagnostics
        </h2>
        <div className="flex gap-2">
          {nodes.some(n => n.latency !== null) && (
            <button
              onClick={resetPings}
              disabled={isTesting}
              className="p-2 border border-border bg-surface text-muted hover:text-text rounded-lg hover:border-accent transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={runPingTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
          >
            <Network className="h-3.5 w-3.5" /> {isTesting ? "Testing Nodes..." : "Run Ping Diagnostics"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        <div className="overflow-x-auto scrollbar-hidden">
          <table className="w-full text-sm font-medium">
            <thead>
              <tr className="border-b border-border/80 text-left text-muted text-xs">
                <th className="p-4 font-bold uppercase tracking-wider">Region</th>
                <th className="p-4 font-bold uppercase tracking-wider">Location</th>
                <th className="p-4 font-bold uppercase tracking-wider">Router Code</th>
                <th className="p-4 font-bold uppercase tracking-wider">Ping Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {nodes.map((node) => (
                <tr key={node.id} className="hover:bg-bg/15 transition-colors">
                  <td className="p-4 font-bold text-text text-sm">{node.city}</td>
                  <td className="p-4 text-muted text-xs">{node.country}</td>
                  <td className="p-4 font-mono text-xs text-accent uppercase">{node.code}</td>
                  <td className="p-4 text-xs font-bold">
                    {node.status === "idle" && (
                      <span className="text-muted/60">—</span>
                    )}
                    {node.status === "testing" && (
                      <span className="text-accent flex items-center gap-1.5 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-accent animate-ping" /> testing...
                      </span>
                    )}
                    {node.status === "green" && (
                      <span className="text-success flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> {node.latency} ms
                      </span>
                    )}
                    {node.status === "yellow" && (
                      <span className="text-signal flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> {node.latency} ms
                      </span>
                    )}
                    {node.status === "red" && (
                      <span className="text-error flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0" /> {node.latency} ms
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
