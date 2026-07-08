"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type Invocation = {
  id: string;
  path: string;
  timestamp: string | Date;
  durationMs: number;
  billedDurationMs: number;
  memorySizeMb: number;
  maxMemoryUsedMb: number;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatTimestamp(value: string | Date) {
  const d = new Date(value);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${MONTHS[d.getMonth()]} ${pad(d.getDate())} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}:${pad(d.getMilliseconds(), 3)}`;
}

function invocationLine(inv: Invocation) {
  return `${formatTimestamp(inv.timestamp)}  Duration: ${inv.durationMs.toFixed(2)} ms  Billed Duration: ${inv.billedDurationMs} ms  Memory Size: ${inv.memorySizeMb} MB  Max Memory Used: ${inv.maxMemoryUsedMb} MB`;
}

type LogType = "info" | "success" | "warning" | "error" | "command" | "system";

const LOG_COLORS: Record<LogType, string> = {
  info: "text-[#5BC0DE]",
  success: "text-[#3DDC97]",
  warning: "text-[#FFB020]",
  error: "text-[#FF6B6B]",
  command: "text-[#E7E9EE] font-medium",
  system: "text-[#5A6478]",
};

function parseLogLine(line: string): { type: LogType; text: string; timestamp: string } | null {
  const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\] ([✓⚠✗$■→]) (.*)$/);
  if (!match) return null;
  const [, timestamp, prefix, text] = match;
  const typeMap: Record<string, LogType> = {
    "✓": "success", "⚠": "warning", "✗": "error",
    "$": "command", "■": "system", "→": "info",
  };
  return { type: typeMap[prefix] || "info", text, timestamp };
}

function LogLine({ line }: { line: string }) {
  const parsed = parseLogLine(line);
  if (!parsed) {
    return <div className="text-[#5A6478]">{line}</div>;
  }
  return (
    <div className={`${LOG_COLORS[parsed.type]}`}>
      <span className="text-[#3B4254]">[{parsed.timestamp}]</span>
      <span className="mx-1.5 opacity-50">{parsed.type === "info" ? "→" : parsed.type === "success" ? "✓" : parsed.type === "warning" ? "⚠" : parsed.type === "error" ? "✗" : parsed.type === "command" ? "$" : "■"}</span>
      {parsed.text}
    </div>
  );
}

export function DeploymentLogs({
  deploymentId,
  initialBuildLogs,
  status,
  invocations,
}: {
  deploymentId: string;
  initialBuildLogs: string;
  status: string;
  invocations: Invocation[];
}) {
  const [buildLogs, setBuildLogs] = useState(initialBuildLogs);
  const [liveStatus, setLiveStatus] = useState(status);
  const [view, setView] = useState<"build" | "runtime">("build");
  const [pathFilter, setPathFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveStatus === "success" || liveStatus === "failed") return;
    const evtSource = new EventSource(`/api/projects/deployments/${deploymentId}/stream`);
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.logs !== undefined) setBuildLogs(data.logs);
        if (data.status) {
          setLiveStatus(data.status);
          if (data.status === "success" || data.status === "failed") {
            evtSource.close();
          }
        }
      } catch {
        // ignore malformed events
      }
    };
    evtSource.onerror = () => evtSource.close();
    return () => evtSource.close();
  }, [deploymentId, liveStatus]);

  useEffect(() => {
    if (view === "build") endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [buildLogs, view]);

  const paths = useMemo(
    () => Array.from(new Set(invocations.map((i) => i.path))).sort(),
    [invocations],
  );

  const filteredInvocations = useMemo(() => {
    const sorted = [...invocations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return pathFilter === "all"
      ? sorted
      : sorted.filter((i) => i.path === pathFilter);
  }, [invocations, pathFilter]);

  const buildLines = useMemo(
    () => buildLogs.split("\n").filter(Boolean),
    [buildLogs],
  );

  const displayedText = useMemo(() => {
    if (view === "build") return buildLogs || "Waiting for logs...";
    if (filteredInvocations.length === 0) return "No runtime invocations recorded yet.";
    return filteredInvocations.map(invocationLine).join("\n");
  }, [view, buildLogs, filteredInvocations]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard API unavailable
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-[#8B92A4] uppercase">Deployment Logs</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          liveStatus === "success" ? "bg-[#3DDC97]/10 text-[#3DDC97]" :
          liveStatus === "failed" ? "bg-[#FF6B6B]/10 text-[#FF6B6B]" :
          liveStatus === "building" ? "bg-[#5BC0DE]/10 text-[#5BC0DE]" :
          "bg-white/[0.05] text-[#8B92A4]"
        }`}>
          {liveStatus}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-[#212633]">
          <button
            type="button"
            onClick={() => setView("build")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "build"
                ? "bg-white/[0.08] text-[#E7E9EE]"
                : "text-[#8B92A4] hover:bg-white/[0.04]"
            }`}
          >
            Build
          </button>
          <button
            type="button"
            onClick={() => setView("runtime")}
            className={`border-l border-[#212633] px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "runtime"
                ? "bg-white/[0.08] text-[#E7E9EE]"
                : "text-[#8B92A4] hover:bg-white/[0.04]"
            }`}
          >
            Runtime
          </button>
        </div>

        {view === "runtime" && paths.length > 0 && (
          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="rounded-lg border border-[#212633] bg-[#12151D] px-2.5 py-1.5 text-xs text-[#E7E9EE]"
          >
            <option value="all">All paths</option>
            {paths.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#212633] px-2.5 py-1.5 text-xs text-[#8B92A4] transition-colors hover:bg-white/[0.05] hover:text-[#E7E9EE]"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-xl bg-[#0C0F14] border border-[#212633] p-4 font-mono text-xs leading-[1.7]">
        {view === "build" ? (
          buildLines.length === 0 ? (
            <div className="text-[#5A6478]">Waiting for logs...</div>
          ) : (
            buildLines.map((line, i) => <LogLine key={i} line={line} />)
          )
        ) : (
          <pre className="whitespace-pre-wrap text-[#5A6478]">
            {displayedText}
          </pre>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
