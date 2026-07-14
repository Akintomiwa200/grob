"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
      return;
    }

    interval.current = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [active, router]);

  return null;
}
