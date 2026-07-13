"use client";

import { useEffect, useState } from "react";
import { VisitButton } from "./visit-button";

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  pending: { dot: "bg-[#F5A623]", text: "text-[#F5A623]" },
  building: { dot: "bg-[#0070F3]", text: "text-[#0070F3]" },
  deploying: { dot: "bg-[#0070F3]", text: "text-[#0070F3]" },
  success: { dot: "bg-[#3DDC97]", text: "text-[#3DDC97]" },
  failed: { dot: "bg-[#E5484D]", text: "text-[#E5484D]" },
};

function formatDuration(ms: number | null | undefined) {
  if (!ms || ms < 0) return "\u2014";
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function DeploymentStatus({
  deploymentId,
  initialStatus,
  initialUrl,
  initialDomains,
  initialCreatedAt,
}: {
  deploymentId: string;
  initialStatus: string;
  initialUrl: string | null;
  initialDomains: string[];
  initialCreatedAt: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [url, setUrl] = useState(initialUrl);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "success" || status === "failed") return;

    const evtSource = new EventSource(
      `/api/projects/deployments/${deploymentId}/stream`,
    );
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setStatus(data.status);
          if (data.status === "success" || data.status === "failed") {
            evtSource.close();
          }
        }
      } catch {
        // ignore
      }
    };
    evtSource.onerror = () => evtSource.close();
    return () => evtSource.close();
  }, [deploymentId, status]);

  // Once status becomes success, poll once for the URL if we don't have it
  useEffect(() => {
    if (status === "success" && !url) {
      fetch(`/api/projects/deployments/${deploymentId}/status`)
        .then((r) => r.json())
        .then((data) => {
          if (data.url) setUrl(data.url);
        })
        .catch(() => {});
    }
  }, [status, url, deploymentId]);

  const style = STATUS_STYLES[status] ?? { dot: "bg-gray-400", text: "text-gray-400" };

  const createdAt = new Date(initialCreatedAt);
  const durationMs = mounted && (status === "success" || status === "failed")
    ? Date.now() - createdAt.getTime()
    : null;

  const domains = url ? [url, ...initialDomains.filter((d) => d !== url)] : initialDomains;

  return (
    <>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Status</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm">
            <span className={`h-2 w-2 rounded-full ${style.dot} ${status === "pending" || status === "building" ? "animate-pulse" : ""}`} />
            <span className={`capitalize ${style.text}`}>{status}</span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Smart CDN</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[#0070F3]">
              <circle cx="10" cy="10" r="9" fill="currentColor" />
              <path d="M6 10.5l2.5 2.5L14 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Enabled
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Deployment Duration</p>
          <p className="mt-1.5 text-sm text-text">
            {status === "pending" || status === "building" ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0070F3] animate-pulse" />
                Building...
              </span>
            ) : (
              formatDuration(durationMs)
            )}
          </p>
        </div>
        <div className="col-span-2 flex items-start sm:col-span-1 sm:justify-end lg:col-span-1">
          <VisitButton primaryUrl={url} domains={domains} />
        </div>
      </div>

      {domains.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-muted">Domains</p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {domains.map((d) => (
              <a
                key={d}
                href={d.includes("localhost") || d.includes("127.0.0.1") ? `http://${d}` : `https://${d}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text hover:text-accent hover:underline"
              >
                {d}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
