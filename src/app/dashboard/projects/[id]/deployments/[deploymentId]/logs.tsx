"use client";

import { useEffect, useRef, useState } from "react";

export function DeploymentLogs({
  deploymentId,
  initialLogs,
  status,
}: {
  deploymentId: string;
  initialLogs: string;
  status: string;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "failed") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/projects/deployments/${deploymentId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        if (data.status !== "building" && data.status !== "pending") {
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [deploymentId, status]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-gray-900 dark:bg-black text-green-400 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
      <pre className="whitespace-pre-wrap">
        {logs || "Waiting for logs..."}
        <div ref={endRef} />
      </pre>
    </div>
  );
}
