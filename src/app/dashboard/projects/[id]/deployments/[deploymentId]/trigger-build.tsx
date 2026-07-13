"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  RefreshCw,
  GitCommitHorizontal,
  Trash2,
  Rocket,
  Loader2,
} from "lucide-react";

export function DeployMenu({
  projectId,
  deploymentId,
  hasPreviousDeployment,
  initialStatus,
}: {
  projectId: string;
  deploymentId: string;
  hasPreviousDeployment: boolean;
  initialStatus?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const autoTriggered = useRef(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialStatus !== "pending" || autoTriggered.current) return;
    autoTriggered.current = true;
    triggerDeploy("deploy-latest");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function triggerDeploy(action: string) {
    setLoading(action);
    setOpen(false);

    try {
      await fetch(`/api/deploy/trigger/${deploymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Small delay then refresh to show new status
      setTimeout(() => router.refresh(), 500);
    } catch {
      setLoading(null);
    }
  }

  const isDeploying = loading !== null;

  return (
    <div className="relative" ref={ref}>
      <div className="flex rounded-lg border border-[#212633] overflow-hidden">
        <button
          type="button"
          onClick={() => {
            if (hasPreviousDeployment) {
              triggerDeploy("redeploy");
            } else {
              triggerDeploy("deploy-latest");
            }
          }}
          disabled={isDeploying}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#6E5BFF] hover:bg-[#5A4AE6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDeploying ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Rocket className="h-3.5 w-3.5" />
          )}
          {loading
            ? "Deploying…"
            : hasPreviousDeployment
              ? "Redeploy"
              : "Deploy"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={isDeploying}
          className="flex items-center justify-center px-2 border-l border-[#212633] text-[#8B92A4] hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-[#212633] bg-[#12151D] p-1 shadow-2xl">
          <div className="px-3 py-2 mb-1">
            <p className="text-[10px] uppercase tracking-wider text-[#8B92A4] font-medium">Deploy Options</p>
          </div>

          {hasPreviousDeployment && (
            <button
              type="button"
              onClick={() => triggerDeploy("redeploy")}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#E7E9EE] hover:bg-white/[0.05] transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-[#8B92A4]" />
              <div className="text-left">
                <p className="font-medium">Redeploy</p>
                <p className="text-xs text-[#8B92A4]">Rebuild from the same commit</p>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => triggerDeploy("deploy-latest")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#E7E9EE] hover:bg-white/[0.05] transition-colors"
          >
            <GitCommitHorizontal className="h-4 w-4 text-[#8B92A4]" />
            <div className="text-left">
              <p className="font-medium">Deploy Latest Commit</p>
              <p className="text-xs text-[#8B92A4]">Pull and deploy the newest commit</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => triggerDeploy("redeploy-clean")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#E7E9EE] hover:bg-white/[0.05] transition-colors"
          >
            <Trash2 className="h-4 w-4 text-[#8B92A4]" />
            <div className="text-left">
              <p className="font-medium">Redeploy Clean</p>
              <p className="text-xs text-[#8B92A4]">Clear build cache and redeploy</p>
            </div>
          </button>

          <div className="my-1 border-t border-[#212633]" />

          <button
            type="button"
            onClick={() => triggerDeploy("promote")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#E7E9EE] hover:bg-white/[0.05] transition-colors"
          >
            <Rocket className="h-4 w-4 text-[#8B92A4]" />
            <div className="text-left">
              <p className="font-medium">Promote to Production</p>
              <p className="text-xs text-[#8B92A4]">Set as the primary production URL</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
