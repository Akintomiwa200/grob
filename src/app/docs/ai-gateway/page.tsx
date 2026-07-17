"use client";

import { useState } from "react";
import { Cpu, Send, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";

type ModelKey = "gemini" | "claude" | "gpt4";

export default function AiGatewayPage() {
  const [activeModel, setActiveModel] = useState<ModelKey>("gemini");
  const [prompt, setPrompt] = useState("What is edge routing?");
  const [isCached, setIsCached] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<{
    latency: number;
    tokensIn: number;
    tokensOut: number;
    cached: boolean;
    costSaved: number;
    response: string;
  } | null>(null);

  const modelMetadata = {
    gemini: { name: "Gemini 1.5 Pro", provider: "Google", rateLimit: 50 },
    claude: { name: "Claude 3.5 Sonnet", provider: "Anthropic", rateLimit: 30 },
    gpt4: { name: "GPT-4o", provider: "OpenAI", rateLimit: 40 }
  };

  const modelResponses = {
    gemini: "Edge routing is the practice of directing client traffic to nearest network point of presence (PoP) to minimize server response latency.",
    claude: "Edge routing directs internet traffic to servers located at the edges of a network, ensuring users fetch static assets and data streams closer to their devices.",
    gpt4: "Edge routing optimizes network routing paths by serving application layers directly from local edge proxies or CDN hubs, lowering page loading speeds."
  };

  const handleProxyRequest = async () => {
    setIsProcessing(true);
    setLogs(["Incoming request received on /v1/chat/completions", `Evaluating gateway route keys for provider: ${modelMetadata[activeModel].provider}`]);
    setMetrics(null);

    await wait(400);
    const lookupKey = prompt.trim().toLowerCase();
    
    // Simulating cache check
    setLogs(prev => [...prev, `Checking cache memory index for prompt identifier...`]);
    await wait(300);

    const hit = isCached; // simulated cache state toggle
    
    if (hit) {
      setLogs(prev => [...prev, "✔ Cache HIT! Serving response directly from Edge KV store.", "Routing logs compiled."]);
      setMetrics({
        latency: 4,
        tokensIn: prompt.length / 4,
        tokensOut: modelResponses[activeModel].length / 4,
        cached: true,
        costSaved: 0.008,
        response: modelResponses[activeModel]
      });
    } else {
      setLogs(prev => [...prev, "Cache MISS. Dispatching upstream API request...", `Upstream API handshake status: 200 OK`]);
      await wait(650);
      setLogs(prev => [...prev, "Writing payload to Edge cache cluster...", "Routing logs compiled."]);
      setMetrics({
        latency: 680,
        tokensIn: Math.round(prompt.length / 4),
        tokensOut: Math.round(modelResponses[activeModel].length / 4),
        cached: false,
        costSaved: 0,
        response: modelResponses[activeModel]
      });
      // Next call will HIT if not changed
      setIsCached(true);
    }

    setIsProcessing(false);
  };

  const resetCache = () => {
    setIsCached(false);
    setMetrics(null);
    setLogs([]);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Features</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        AI Gateway
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Secure, rate-limit, and cache LLM API calls globally. With Grob AI Gateway, wrap your AI prompts into dynamic endpoints that save latency and usage tokens.
      </p>

      {/* Gateway Widget */}
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
        <Cpu className="h-5 w-5 text-accent animate-pulse" /> Real-time Prompt Proxy Router
      </h2>
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* Form headers */}
        <div className="border-b border-border bg-bg/40 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Gateway Endpoint Route</span>
            <code className="bg-bg border border-border px-2.5 py-1.5 rounded-lg font-mono text-accent text-xs font-semibold">
              https://api.grob.dev/v1/ai/route
            </code>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Target Model</label>
              <select
                value={activeModel}
                onChange={(e) => {
                  setActiveModel(e.target.value as ModelKey);
                  resetCache();
                }}
                className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text focus:outline-none"
              >
                <option value="gemini">Gemini 1.5 Pro</option>
                <option value="claude">Claude 3.5 Sonnet</option>
                <option value="gpt4">GPT-4o</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input prompt */}
        <div className="p-5 border-b border-border space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Model Input Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                resetCache();
              }}
              rows={2}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-accent resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted font-medium">Cache status:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isCached ? "bg-success/15 text-success" : "bg-border text-muted"
              }`}>{isCached ? "Warm (Will Hit)" : "Cold"}</span>
            </div>
            
            <div className="flex gap-2">
              {isCached && (
                <button
                  onClick={resetCache}
                  className="px-3.5 py-1.5 border border-border rounded-lg text-xs font-bold text-muted hover:text-text hover:bg-bg transition-all cursor-pointer"
                >
                  Clear Cache
                </button>
              )}
              <button
                onClick={handleProxyRequest}
                disabled={isProcessing || !prompt.trim()}
                className="flex items-center gap-1 bg-accent text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
              >
                <Send className="h-3 w-3" /> Proxy Prompt Request
              </button>
            </div>
          </div>
        </div>

        {/* Trace logs */}
        {logs.length > 0 && (
          <div className="p-5 bg-bg/25 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Proxy Trace Logs</h4>
            <div className="p-4 bg-black/95 text-white font-mono text-xs rounded-xl space-y-1.5 leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className={log.startsWith("✔") ? "text-success font-semibold" : ""}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics telemetry report */}
        {metrics && (
          <div className="border-t border-border bg-bg/35 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Invocation Diagnostics</h4>
            <div className="grid gap-3 sm:grid-cols-4 text-center text-xs font-semibold mb-4">
              <div className="p-3 bg-surface border border-border rounded-xl shadow-sm">
                <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Latency</span>
                <span className={`text-base font-bold ${metrics.cached ? "text-success animate-pulse" : "text-text"}`}>{metrics.latency} ms</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl shadow-sm">
                <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Tokens Used</span>
                <span className="text-base font-bold text-text">{Math.round(metrics.tokensIn + metrics.tokensOut)}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl shadow-sm">
                <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Cache Status</span>
                <span className={`text-base font-bold ${metrics.cached ? "text-success" : "text-muted"}`}>{metrics.cached ? "HIT" : "MISS"}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl shadow-sm">
                <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Estimated Cost</span>
                <span className="text-base font-bold text-text">${(metrics.cached ? 0 : 0.0014).toFixed(5)}</span>
              </div>
            </div>

            <div className="p-4 bg-surface border border-border rounded-xl shadow-sm">
              <span className="block text-muted text-[10px] uppercase font-bold tracking-wider mb-1.5">Model Output</span>
              <p className="text-sm font-medium text-text leading-relaxed">{metrics.response}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 text-sm">
          <h3 className="font-bold text-text mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-accent" /> Cost Optimization
          </h3>
          <p className="text-muted leading-relaxed">
            By storing prompt embeddings inside edge network KV namespaces, duplicate queries are resolved at the closest edge router (4ms) without hitting provider models, yielding up to 90% savings in token charges.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 text-sm">
          <h3 className="font-bold text-text mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="h-4.5 w-4.5 text-signal" /> Intelligent Failovers
          </h3>
          <p className="text-muted leading-relaxed">
            If Google Gemini or Anthropic Claude returns a 503 or reaches its rate limits, the Grob AI Gateway can automatically route query payloads to your backup GPT-4o keys in real time.
          </p>
        </div>
      </div>
    </div>
  );
}
