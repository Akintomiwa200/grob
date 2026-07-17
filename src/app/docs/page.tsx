"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Terminal as TerminalIcon, GitBranch, Globe, LayoutTemplate, Play, RotateCcw, CheckCircle, Activity, Server, Cpu } from "lucide-react";

export default function DocsPage() {
  const [terminalStep, setTerminalStep] = useState<"idle" | "installing" | "logging-in" | "deploying" | "done">("idle");
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["guest@grob:~$ _"]);
  const [apiLatency, setApiLatency] = useState(24);
  const [edgeLatency, setEdgeLatency] = useState(14);

  // Simulated live latency pings
  useEffect(() => {
    const interval = setInterval(() => {
      setApiLatency(prev => Math.max(15, Math.min(45, prev + (Math.random() > 0.5 ? 1 : -1))));
      setEdgeLatency(prev => Math.max(8, Math.min(25, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const runCommand = async (step: typeof terminalStep) => {
    if (terminalStep !== "idle" && step !== "idle") return;
    
    if (step === "idle") {
      setTerminalStep("idle");
      setTerminalLogs(["guest@grob:~$ _"]);
      return;
    }

    setTerminalStep(step);

    if (step === "installing") {
      setTerminalLogs(["guest@grob:~$ npm install -g grob-cli"]);
      await wait(600);
      appendLog("Downloading grob-cli package from npm registry...");
      await wait(800);
      appendLog("Extracting packages... [==============================] 100%");
      await wait(600);
      appendLog("+ grob-cli@1.4.2 added in 2.1s");
      appendLog("guest@grob:~$ _");
      setTerminalStep("idle");
    } 
    
    else if (step === "logging-in") {
      setTerminalLogs(["guest@grob:~$ grob login"]);
      await wait(600);
      appendLog("Opening browser authentication page...");
      await wait(900);
      appendLog("✔ Logged in successfully as alex@grob.dev");
      appendLog("guest@grob:~$ _");
      setTerminalStep("idle");
    } 
    
    else if (step === "deploying") {
      setTerminalLogs(["guest@grob:~$ grob deploy"]);
      await wait(600);
      appendLog("Scanning project directory...");
      await wait(500);
      appendLog("Detected Next.js framework configuration");
      appendLog("Uploading project assets (1.2 MB)... [100%]");
      await wait(800);
      appendLog("Building project pipeline...");
      appendLog("  ↳ Running npm run build...");
      await wait(1000);
      appendLog("  ✔ Compiled client-side assets (42.1 KB)");
      appendLog("  ✔ Generated Serverless functions (3 API routes)");
      appendLog("Provisioning custom SSL edge routing...");
      await wait(700);
      appendLog("✔ Production deployment created!");
      appendLog("🔗 URL: https://grob-app.dev");
      appendLog("guest@grob:~$ _");
      setTerminalStep("done");
    }
  };

  const appendLog = (log: string) => {
    setTerminalLogs(prev => {
      const logs = [...prev];
      // remove prompt
      if (logs[logs.length - 1] === "guest@grob:~$ _") {
        logs.pop();
      }
      logs.push(log);
      logs.push("guest@grob:~$ _");
      return logs;
    });
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Getting Started</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Introduction to Grob
      </h1>
      
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Welcome to the Grob documentation. Grob is a modern deployment platform that helps you build, scale, and secure your applications with zero configuration. 
        We handle your serverless API scaling, custom domains, and edge-caching so you can build premium user experiences.
      </p>

      {/* Grid Cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        <Link 
          href="/docs/quickstart" 
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-border group-hover:bg-accent/20 transition-colors">
            <TerminalIcon className="h-5 w-5 text-text group-hover:text-accent" />
          </div>
          <h3 className="mb-1.5 font-bold text-text">Quickstart Guide</h3>
          <p className="text-sm text-muted mb-4 flex-1">
            Connect your repository and push to production in less than three minutes.
          </p>
          <div className="flex items-center text-sm font-semibold text-accent">
            Go to Quickstart <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link 
          href="/docs/frameworks" 
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-border group-hover:bg-accent/20 transition-colors">
            <LayoutTemplate className="h-5 w-5 text-text group-hover:text-accent" />
          </div>
          <h3 className="mb-1.5 font-bold text-text">Frameworks Support</h3>
          <p className="text-sm text-muted mb-4 flex-1">
            Optimized zero-config setups for Next.js, Vite React, Nuxt Vue, Astro, and SvelteKit.
          </p>
          <div className="flex items-center text-sm font-semibold text-accent">
            Explore Frameworks <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* Interactive CLI Console */}
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <TerminalIcon className="h-5 w-5 text-accent animate-pulse" /> Try the CLI in Real-Time
      </h2>
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-lg mb-12">
        <div className="flex items-center justify-between border-b border-border bg-bg/40 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-error" />
            <span className="h-3 w-3 rounded-full bg-signal" />
            <span className="h-3 w-3 rounded-full bg-success" />
            <span className="text-xs font-mono font-medium text-muted ml-2">grob-cli simulator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => runCommand("idle")}
              title="Reset terminal"
              className="p-1 rounded hover:bg-border text-muted hover:text-text transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-black/95 text-white font-mono text-sm min-h-[220px] overflow-y-auto max-h-[300px] leading-relaxed flex flex-col justify-between">
          <div className="space-y-1.5">
            {terminalLogs.map((log, index) => (
              <div key={index} className={log.startsWith("✔") || log.startsWith("✔") ? "text-success font-semibold" : log.startsWith("🔗") ? "text-accent font-semibold underline" : log.includes("Error") ? "text-error" : ""}>
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border bg-bg/25 p-3 flex flex-wrap gap-2.5 items-center justify-between">
          <span className="text-xs text-muted font-medium">Click step to simulate running locally:</span>
          <div className="flex gap-2">
            <button
              onClick={() => runCommand("installing")}
              disabled={terminalStep !== "idle"}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="h-3 w-3" /> Step 1: Install CLI
            </button>
            <button
              onClick={() => runCommand("logging-in")}
              disabled={terminalStep !== "idle"}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="h-3 w-3" /> Step 2: CLI Login
            </button>
            <button
              onClick={() => runCommand("deploying")}
              disabled={terminalStep !== "idle"}
              className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-3.5 py-1.5 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-accent/20"
            >
              <Play className="h-3 w-3" /> Step 3: Run Deploy
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status Badge Component */}
      <h2 className="text-xl font-bold text-text mb-4">Platform Real-time Health</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 shrink-0">
            <Activity className="h-5 w-5 text-success animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted">Edge Routing Uptime</div>
            <div className="text-sm font-bold text-text">99.998%</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 shrink-0">
            <Server className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted">API Gateway Latency</div>
            <div className="text-sm font-bold text-text">{apiLatency} ms <span className="text-[10px] text-success font-medium">live</span></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15 shrink-0">
            <Cpu className="h-5 w-5 text-info" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted">Edge Node Latency</div>
            <div className="text-sm font-bold text-text">{edgeLatency} ms <span className="text-[10px] text-success font-medium">live</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
