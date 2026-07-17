"use client";

import { useState } from "react";
import { Play, CheckCircle2, Circle, RefreshCw, Clock, Terminal, Cpu } from "lucide-react";

interface PipelineStep {
  name: string;
  command: string;
  status: "idle" | "running" | "success" | "failed";
  duration: number | null;
}

export default function WorkflowsPage() {
  const [steps, setSteps] = useState<PipelineStep[]>([
    { name: "Code Linter", command: "npm run lint", status: "idle", duration: null },
    { name: "Unit Tests", command: "npm test", status: "idle", duration: null },
    { name: "Security Audit", command: "npm run audit", status: "idle", duration: null },
    { name: "Release Bundler", command: "npm run build", status: "idle", duration: null }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [totalTime, setTotalTime] = useState(0);

  const startPipeline = async () => {
    setIsRunning(true);
    setConsoleLogs(["[WORKFLOW] Initializing workspace runners...", "[WORKFLOW] Loading CI configuration from .grob/workflows.yml"]);
    setTotalTime(0);

    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: "idle", duration: null })));

    for (let i = 0; i < steps.length; i++) {
      // Set current step to running
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "running" } : s));
      setConsoleLogs(prev => [...prev, `[RUN] Executing: ${steps[i].command}`]);
      
      const stepDuration = Math.round(1 + Math.random() * 3);
      await wait(1200);

      // Set current step to success
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "success", duration: stepDuration } : s));
      setConsoleLogs(prev => [...prev, `✔ Step finished: ${steps[i].name} (Exit code: 0)`]);
      setTotalTime(prev => prev + stepDuration);
    }

    setConsoleLogs(prev => [...prev, "[WORKFLOW] All pipeline actions completed successfully.", "🚀 Deployment generated."]);
    setIsRunning(false);
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Features</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Workflows &amp; Actions
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Configure automated workflows and CI/CD actions that run checks directly on every commit push or pull request. Define linting rules, run unit tests, and build packages natively.
      </p>

      {/* Interactive pipeline runner */}
      <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
        <Cpu className="h-5 w-5 text-accent animate-pulse" /> Action Pipeline Runner
      </h2>
      
      <div className="grid gap-6 lg:grid-cols-12 mb-12">
        {/* Pipeline steps visualizer list */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xl lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-text mb-2">Build Steps</h3>
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border bg-bg/15 rounded-xl text-xs font-semibold">
                <div className="flex items-center gap-3">
                  {step.status === "idle" && (
                    <Circle className="h-4.5 w-4.5 text-muted shrink-0" />
                  )}
                  {step.status === "running" && (
                    <RefreshCw className="h-4.5 w-4.5 text-accent animate-spin shrink-0" />
                  )}
                  {step.status === "success" && (
                    <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0 animate-pulse" />
                  )}
                  <div>
                    <span className="block text-text font-bold text-xs sm:text-sm">{step.name}</span>
                    <code className="text-[10px] font-mono text-muted">{step.command}</code>
                  </div>
                </div>

                <div className="text-muted font-mono font-medium text-[10px]">
                  {step.status === "running" && <span className="text-accent">running...</span>}
                  {step.status === "success" && <span>{step.duration}s</span>}
                  {step.status === "idle" && <span>—</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center flex-wrap gap-2.5">
            <span className="text-xs text-muted font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Total execution: <span className="font-mono font-bold text-text">{totalTime}s</span>
            </span>
            <button
              onClick={startPipeline}
              disabled={isRunning}
              className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
            >
              <Play className="h-3.5 w-3.5" /> Run Workflow
            </button>
          </div>
        </div>

        {/* Console outputs logs */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl lg:col-span-5 flex flex-col justify-between">
          <div className="border-b border-border bg-bg/40 px-4 py-2.5 text-xs font-bold text-muted flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-accent" /> console-logs
          </div>
          
          <div className="p-4 bg-black/95 text-white font-mono text-[11px] leading-relaxed flex-1 min-h-[220px] max-h-[300px] overflow-y-auto">
            {consoleLogs.length === 0 ? (
              <div className="text-muted/50 text-center my-auto py-16">
                Console logs idle. Trigger pipeline run.
              </div>
            ) : (
              <div className="space-y-1">
                {consoleLogs.map((log, i) => (
                  <div key={i} className={log.startsWith("✔") ? "text-success font-semibold" : log.startsWith("[WORKFLOW]") ? "text-muted" : "text-white"}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
