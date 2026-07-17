"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, HardDrive, Play, StopCircle, RefreshCw } from "lucide-react";

interface LogLine {
  text: string;
  type: "info" | "warn" | "error";
  time: string;
}

export default function BuildsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [cpuVal, setCpuVal] = useState(0);
  const [ramVal, setRamVal] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [filter, setFilter] = useState<"all" | "warn" | "error">("all");
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Telemetry random changes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setCpuVal(Math.floor(Math.random() * 45) + 30);
        setRamVal(Math.floor(Math.random() * 150) + 450);
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setCpuVal(0);
      setRamVal(0);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const rawLogs: Omit<LogLine, "time">[] = [
    { text: "clone repository successfully from github-auth-proxy", type: "info" },
    { text: "installing dependencies using pnpm store cache", type: "info" },
    { text: "pnpm install: added 1205 packages in 3.44s", type: "info" },
    { text: "next build initialized [Node: v20.11.0, Cache: Enabled]", type: "info" },
    { text: "compiling src/app/dashboard/analytics/page.tsx", type: "info" },
    { text: "compiled client pages in 2.1s", type: "info" },
    { text: "warning: deprecated dependency usage in src/components/Sidebar.tsx on L42", type: "warn" },
    { text: "warning: unused import statement 'React' in src/lib/languages.ts L1", type: "warn" },
    { text: "bundle size check: total server bundle size: 2.14 MB", type: "info" },
    { text: "packaging functions and provisioning global API endpoints", type: "info" },
    { text: "uploading static assets to Amazon CloudFront edge nodes", type: "info" },
    { text: "deployment successfully created!", type: "info" }
  ];

  const triggerBuild = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setElapsed(0);

    for (let i = 0; i < rawLogs.length; i++) {
      if (!isRunning) {
        // Double check state inside loop
      }
      await wait(600 + Math.random() * 400);
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, { ...rawLogs[i], time: timestamp }]);
    }
    setIsRunning(false);
  };

  const stopBuild = () => {
    setIsRunning(false);
    setLogs(prev => [...prev, { text: "build process cancelled by administrator.", type: "error", time: new Date().toLocaleTimeString() }]);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Deploying</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Builds Configuration
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Customize build scripts, cache steps, and track compilation metrics. Monitor build pipelines in real-time to locate compilation errors immediately.
      </p>

      {/* Real-time Console */}
      <h2 className="text-lg font-bold text-text mb-4">Real-time Build Console</h2>
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl mb-12">
        {/* Telemetry Metrics header */}
        <div className="flex flex-wrap items-center justify-between border-b border-border bg-bg/40 px-4 py-3 gap-3 text-xs">
          <div className="flex items-center gap-5">
            <span className="font-mono text-muted flex items-center gap-1.5 font-semibold">
              <Terminal className="h-4 w-4 text-accent" /> build-pipeline
            </span>
            <div className="flex items-center gap-1 text-muted">
              <Cpu className="h-3.5 w-3.5" /> CPU: <span className="font-mono font-semibold text-text">{cpuVal}%</span>
            </div>
            <div className="flex items-center gap-1 text-muted">
              <HardDrive className="h-3.5 w-3.5" /> Memory: <span className="font-mono font-semibold text-text">{ramVal} MB</span>
            </div>
            <div className="text-muted">
              Elapsed: <span className="font-mono font-semibold text-text">{elapsed}s</span>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${filter === "all" ? "bg-accent/15 text-accent" : "text-muted hover:bg-bg"}`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilter("warn")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${filter === "warn" ? "bg-signal/15 text-signal" : "text-muted hover:bg-bg"}`}
            >
              Warnings
            </button>
            <button
              onClick={() => setFilter("error")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${filter === "error" ? "bg-error/15 text-error" : "text-muted hover:bg-bg"}`}
            >
              Errors
            </button>
          </div>
        </div>

        {/* Terminal screen */}
        <div className="p-4 bg-black/95 text-white font-mono text-xs min-h-[220px] max-h-[300px] overflow-y-auto leading-relaxed flex flex-col">
          {filteredLogs.length === 0 ? (
            <div className="text-muted/60 text-center my-auto">
              Console idle. Click &quot;Trigger Build&quot; below to start deployment logs.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="text-muted/50 shrink-0 select-none">[{log.time}]</span>
                  <span className={
                    log.type === "warn" 
                      ? "text-signal font-semibold" 
                      : log.type === "error" 
                        ? "text-error font-semibold" 
                        : "text-white"
                  }>
                    {log.type === "warn" ? "[WARN] " : log.type === "error" ? "[ERR] " : ""}
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="bg-bg/25 p-3 flex items-center justify-between">
          <span className="text-xs text-muted font-medium flex items-center gap-1">
            {isRunning && <RefreshCw className="h-3 w-3 animate-spin text-accent" />}
            {isRunning ? "Pipeline running" : "Pipeline ready"}
          </span>
          <div className="flex gap-2">
            {isRunning ? (
              <button
                onClick={stopBuild}
                className="flex items-center gap-1.5 rounded-lg border border-error/30 hover:border-error bg-surface text-error hover:bg-error/5 px-4.5 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <StopCircle className="h-3.5 w-3.5" /> Stop Build
              </button>
            ) : (
              <button
                onClick={triggerBuild}
                className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4.5 py-2 text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-accent/15"
              >
                <Play className="h-3.5 w-3.5" /> Trigger Build
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
