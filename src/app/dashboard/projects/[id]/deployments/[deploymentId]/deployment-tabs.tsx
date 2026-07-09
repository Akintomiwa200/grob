"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", segment: "" },
  { label: "Functions", segment: "functions" },
  { label: "Source", segment: "source" },
];

export function DeploymentTabs({
  projectId,
  deploymentId,
}: {
  projectId: string;
  deploymentId: string;
}) {
  const pathname = usePathname();
  const base = `/dashboard/projects/${projectId}/deployments/${deploymentId}`;

  return (
    <div className="flex gap-6 border-b border-border">
      {TABS.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base;
        const active = pathname === href;
        return (
          <Link
            key={tab.label}
            href={href}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              active ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#E7E9EE]" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
