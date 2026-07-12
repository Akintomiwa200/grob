"use client";

import { useEffect, useRef } from "react";

export function TriggerBuild({ deploymentId }: { deploymentId: string }) {
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    fetch(`/api/deploy/trigger/${deploymentId}`, { method: "POST" }).catch(
      () => {},
    );
  }, [deploymentId]);

  return null;
}
