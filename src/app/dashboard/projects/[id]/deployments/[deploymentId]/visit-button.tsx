"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function VisitButton({
  primaryUrl,
  domains,
}: {
  primaryUrl: string | null;
  domains: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toUrl = (d: string) =>
    d.includes("localhost") || d.includes("127.0.0.1") ? `http://${d}` : `https://${d}`;

  if (!primaryUrl) {
    return (
      <button
        type="button"
        disabled
        className="cursor-not-allowed rounded-lg bg-border px-4 py-2 text-sm font-medium text-muted"
      >
        Visit
      </button>
    );
  }

  return (
    <div ref={ref} className="relative inline-flex">
      <a
        href={toUrl(primaryUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-l-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
      >
        Visit
      </a>
      <button
        type="button"
        aria-label="Show all domains"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded-r-lg border-l border-white/20 bg-accent px-2 py-2 text-white hover:brightness-110"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && domains.length > 0 && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-xl">
          {domains.map((d) => (
            <a
              key={d}
              href={toUrl(d)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block truncate px-3 py-2 text-sm text-text hover:bg-white/[0.05]"
            >
              {d}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
