"use client";

import { useEffect, useRef } from "react";
import { autoRedeploy } from "@/app/dashboard/projects/[id]/actions";

const deployed = new Set<string>();

export function AutoRedeploy({ projectId }: { projectId: string }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current || deployed.has(projectId)) return;
    called.current = true;
    deployed.add(projectId);
    autoRedeploy(projectId).catch(() => {});
  }, [projectId]);

  return null;
}
