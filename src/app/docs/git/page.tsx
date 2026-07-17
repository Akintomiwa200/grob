"use client";

import { useState } from "react";
import { GitBranch, GitPullRequest, CheckCircle2, RotateCw, ExternalLink } from "lucide-react";

export default function GitIntegrationPage() {
  const [prCheckState, setPrCheckState] = useState<"idle" | "queued" | "building" | "success">("idle");
  const [progressText, setProgressText] = useState("Grob Preview Deployment — Ready");

  const runMockCheck = async () => {
    setPrCheckState("queued");
    setProgressText("Grob Preview Deployment — Queued in queue...");
    
    await wait(800);
    setPrCheckState("building");
    setProgressText("Grob Preview Deployment — Running build pipeline...");
    
    await wait(1200);
    setPrCheckState("success");
    setProgressText("Grob Preview Deployment — Success: Live at https://grob-pr-24.dev");
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Deploying</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Git Integration
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Grob connects with your repository providers to enable instant deployments on every commit. Merge with confidence using previews.
      </p>

      {/* GitHub Pull Request Mockup UI */}
      <h2 className="text-lg font-bold text-text mb-4">Live Preview Deployment Simulator</h2>
      <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden mb-12">
        {/* GitHub Header */}
        <div className="border-b border-border bg-bg/40 p-4.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-purple-500/10 text-purple-500 shrink-0">
              <GitPullRequest className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-text text-sm sm:text-base">PR #42: Add glassmorphism layout</h3>
              <p className="text-xs text-muted mt-0.5 font-medium">
                <span className="font-semibold text-text">alex-dev</span> wants to merge 3 commits into <code className="bg-bg px-1 py-0.5 rounded text-accent font-semibold font-mono text-[10px]">main</code>
              </p>
            </div>
          </div>
        </div>

        {/* PR Body Checklist */}
        <div className="p-5 border-b border-border">
          <h4 className="font-semibold text-sm text-text mb-3">Checks:</h4>
          
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-bg/20">
            <div className="shrink-0 mt-0.5">
              {prCheckState === "idle" || prCheckState === "success" ? (
                <div className="h-5.5 w-5.5 rounded-full bg-success/15 flex items-center justify-center text-success">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : (
                <div className="h-5.5 w-5.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-sm text-text">grob/preview-deploy</span>
                {prCheckState === "success" && (
                  <a
                    href="https://grob-pr-24.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent font-bold hover:underline"
                  >
                    View Preview <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className={`text-xs mt-1 font-mono ${prCheckState === "success" ? "text-success font-semibold" : "text-muted"}`}>{progressText}</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-bg/25 p-4 flex items-center justify-between">
          <span className="text-xs text-muted font-medium">Connect repository triggers to automate builds</span>
          <button
            onClick={runMockCheck}
            disabled={prCheckState === "queued" || prCheckState === "building"}
            className="flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/15"
          >
            <RotateCw className="h-3.5 w-3.5" /> Re-trigger PR Check
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-base font-bold text-text mb-2">Production Branch Monitoring</h3>
          <p className="text-sm text-muted leading-relaxed">
            Every time a commit is merged or pushed directly to your <code className="bg-bg border border-border px-1.5 py-0.5 rounded text-accent font-semibold font-mono text-xs">main</code> branch, Grob builds and propagates it immediately to the production network.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-text mb-2">Multi-provider Webhooks</h3>
          <p className="text-sm text-muted leading-relaxed">
            We support GitHub, GitLab, and Bitbucket out-of-the-box. Webhooks are configured securely with secret tokens during authorization, protecting your source files from exposure.
          </p>
        </div>
      </div>
    </div>
  );
}
