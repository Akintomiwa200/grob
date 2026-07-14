"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  GitBranch,
  GitCommitHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CircleDot,
} from "lucide-react";

interface Deployment {
  id: string;
  status: string;
  logs: string;
  branch: string;
  commitSha: string;
  commitMsg: string;
  createdAt: string;
}

const statusConfig: Record<
  string,
  { dot: string; label: string; icon: React.ReactNode }
> = {
  success: {
    dot: "bg-success",
    label: "Success",
    icon: <CheckCircle2 className="w-4 h-4 text-success" />,
  },
  failed: {
    dot: "bg-error",
    label: "Failed",
    icon: <XCircle className="w-4 h-4 text-error" />,
  },
  building: {
    dot: "bg-info",
    label: "Building",
    icon: <Loader2 className="w-4 h-4 text-info animate-spin" />,
  },
  pending: {
    dot: "bg-yellow-500",
    label: "Pending",
    icon: <CircleDot className="w-4 h-4 text-yellow-500" />,
  },
};

export function LogViewer({
  deployments,
  projectName,
}: {
  deployments: Deployment[];
  projectName: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = deployments.filter((dep) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      dep.commitMsg.toLowerCase().includes(q) ||
      dep.branch.toLowerCase().includes(q) ||
      dep.commitSha.toLowerCase().includes(q) ||
      dep.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Filter by message, branch, commit, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border rounded-xl bg-surface p-10 text-center">
          <p className="text-muted text-sm">
            {search ? "No deployments match your filter." : "No deployments yet."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-bg/50 divide-y divide-border overflow-hidden">
          {filtered.map((dep) => {
            const cfg = statusConfig[dep.status] || statusConfig.pending;
            const isExpanded = expandedId === dep.id;

            return (
              <div key={dep.id}>
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : dep.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                    )}
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">
                        {dep.commitMsg || "Manual Deployment"}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <GitBranch className="w-3 h-3" />
                          {dep.branch || "main"}
                        </span>
                        {dep.commitSha && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted font-mono">
                            <GitCommitHorizontal className="w-3 h-3" />
                            {dep.commitSha.slice(0, 7)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg ${
                        dep.status === "success"
                          ? "bg-success/10 text-success"
                          : dep.status === "failed"
                            ? "bg-error/10 text-error"
                            : dep.status === "building"
                              ? "bg-info/10 text-info"
                              : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="w-3 h-3" />
                      {new Date(dep.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                          Build Logs
                        </span>
                        <span className="text-[10px] text-muted font-mono">
                          ({dep.logs ? dep.logs.split("\n").length : 0} lines)
                        </span>
                      </div>
                      <pre className="bg-[#0B0E14] rounded-xl p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
                        <code className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
                          {dep.logs || "No logs available for this deployment."}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
