"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, RefreshCw, Trash2, Loader2, RotateCcw } from "lucide-react";

export function DeploymentCardMenu({
  projectId,
  deploymentId,
}: {
  projectId: string;
  deploymentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleRedeploy() {
    setLoading("redeploy");
    setOpen(false);
    try {
      await fetch(`/api/deploy/trigger/${deploymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeploy" }),
      });
      setTimeout(() => router.refresh(), 500);
    } catch {
      setLoading(null);
    }
  }

  async function handleRollback() {
    setLoading("rollback");
    setOpen(false);
    try {
      await fetch(`/api/deploy/trigger/${deploymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote" }),
      });
      setTimeout(() => router.refresh(), 500);
    } catch {
      setLoading(null);
    }
  }

  async function handleDelete() {
    setLoading("delete");
    setOpen(false);
    try {
      const res = await fetch(`/api/deployments/${deploymentId}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.05] disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-surface p-1 shadow-2xl">
          <button
            type="button"
            onClick={handleRedeploy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text hover:bg-white/[0.05] transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-muted" />
            Redeploy
          </button>

          <button
            type="button"
            onClick={handleRollback}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text hover:bg-white/[0.05] transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-muted" />
            Rollback to this commit
          </button>

          <div className="my-1 border-t border-border" />

          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
