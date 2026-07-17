"use client";

import { useState } from "react";
import { Terminal, Play, CheckCircle2, Server, Cpu } from "lucide-react";

type Runtime = "nodejs" | "python" | "go";

export default function ServerlessPage() {
  const [runtime, setRuntime] = useState<Runtime>("nodejs");
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [response, setResponse] = useState<string>("");
  const [latency, setLatency] = useState<number | null>(null);

  const codeTemplates = {
    nodejs: `// api/hello.js (Node.js)
export async function GET(request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Developer";
  
  return Response.json({
    message: \`Hello \${name} from Grob Serverless!\`,
    timestamp: new Date().toISOString(),
    engine: "Node.js v20.x"
  });
}`,
    python: `# api/hello.py (Python)
from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "message": "Hello from Python on Grob Edge Serverless!",
            "timestamp": datetime.utcnow().isoformat(),
            "engine": "Python 3.12"
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))`,
    go: `// api/hello.go (Go)
package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	resp := map[string]string{
		"message":   "Hello from Go compiled routing on Grob!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"engine":    "Go 1.22",
	}
	json.NewEncoder(w).Encode(resp)
}`
  };

  const runCode = async () => {
    setIsExecuting(true);
    setLogs(["[SYSTEM] Cold-starting microVM runner...", "[SYSTEM] Resolving routing endpoints..."]);
    setResponse("");
    setLatency(null);

    await wait(600);
    setLogs(prev => [...prev, `[RUNTIME] Loaded ${runtime} executor package.`]);
    
    await wait(500);
    setLogs(prev => [...prev, "[LOG] Resolving query parameters from request stream.", "[LOG] Executing route handler logic..."]);
    
    await wait(400);
    setLogs(prev => [...prev, "[SYSTEM] Request response code 200 returned.", "[SYSTEM] Execution finished successfully."]);
    
    setLatency(Math.round(12 + Math.random() * 8));

    if (runtime === "nodejs") {
      setResponse(JSON.stringify({
        message: "Hello Developer from Grob Serverless!",
        timestamp: new Date().toISOString(),
        engine: "Node.js v20.x"
      }, null, 2));
    } else if (runtime === "python") {
      setResponse(JSON.stringify({
        message: "Hello from Python on Grob Edge Serverless!",
        timestamp: new Date().toISOString(),
        engine: "Python 3.12"
      }, null, 2));
    } else {
      setResponse(JSON.stringify({
        message: "Hello from Go compiled routing on Grob!",
        timestamp: new Date().toISOString(),
        engine: "Go 1.22"
      }, null, 2));
    }

    setIsExecuting(false);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Features</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Serverless Functions
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Deploy serverless backend endpoints side-by-side with your frontend application. Simply add files under the <code className="bg-bg border border-border px-1.5 py-0.5 rounded text-accent font-semibold font-mono text-sm">api/</code> directory, and they are compiled as standalone serverless endpoints.
      </p>

      {/* Code panel & runner */}
      <div className="grid gap-6 lg:grid-cols-12 mb-12">
        {/* Left Side: Code Editor */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border bg-bg/40 px-4 py-2 text-xs">
            <span className="font-mono text-muted flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-accent" /> API Code Editor
            </span>
            <div className="flex gap-1.5">
              {(["nodejs", "python", "go"] as Runtime[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRuntime(r);
                    setLogs([]);
                    setResponse("");
                    setLatency(null);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    runtime === r ? "bg-accent/15 text-accent" : "text-muted hover:bg-bg"
                  }`}
                >
                  {r === "nodejs" ? "JS/TS" : r}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-black/95 text-white font-mono text-xs overflow-x-auto min-h-[220px] max-h-[300px] leading-relaxed">
            <pre>{codeTemplates[runtime]}</pre>
          </div>

          <div className="bg-bg/25 p-3 flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Automatic API compiling</span>
            <button
              onClick={runCode}
              disabled={isExecuting}
              className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
            >
              <Play className="h-3 w-3" /> Invoke Function
            </button>
          </div>
        </div>

        {/* Right Side: Log Console / Response */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl lg:col-span-5 flex flex-col">
          <div className="border-b border-border bg-bg/40 px-4 py-2.5 text-xs font-bold text-muted">
            Execution telemetry &amp; logs
          </div>
          
          <div className="flex-1 p-4 bg-black/95 text-white font-mono text-xs flex flex-col justify-between min-h-[220px] max-h-[300px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-muted/50 text-center my-auto">
                Execution status idle. Click &quot;Invoke Function&quot; to test.
              </div>
            ) : (
              <div className="space-y-1.5 flex-1">
                {logs.map((log, i) => (
                  <div key={i} className={log.startsWith("[SYSTEM]") ? "text-muted/60" : log.startsWith("[LOG]") ? "text-accent" : "text-white"}>
                    {log}
                  </div>
                ))}

                {response && (
                  <div className="mt-4 pt-3 border-t border-border/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success block mb-1.5">JSON RESPONSE</span>
                    <pre className="text-success leading-relaxed">{response}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {latency !== null && (
            <div className="border-t border-border bg-bg/25 p-3.5 flex items-center justify-between text-xs font-semibold">
              <span className="text-muted flex items-center gap-1.5"><Server className="h-4 w-4 text-success" /> Gateway: 200 OK</span>
              <span className="text-muted flex items-center gap-1.5"><Cpu className="h-4 w-4 text-accent" /> Latency: {latency} ms</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-base font-bold text-text mb-2">Zero Cold Starts</h3>
          <p className="text-sm text-muted leading-relaxed">
            API endpoints are deployed to global V8 isolate sandboxes. Our microVM technology resolves routing in under 15ms, eliminating standard container boot latency.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-text mb-2">Supported Runtimes</h3>
          <p className="text-sm text-muted leading-relaxed">
            By default, Grob compiles and runs JS/TS routes (Node.js/Bun), Python routes, and Go native routes. Environment variables are automatically loaded inside execution sandboxes.
          </p>
        </div>
      </div>
    </div>
  );
}
