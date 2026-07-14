"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { name: string; href: string };

function getProjectTabs(projectId: string, pathname: string): Tab[] {
  const base = `/dashboard/projects/${projectId}`;
  const segments = pathname.replace(base, "").split("/").filter(Boolean);

  if (segments[0] === "settings") {
    return [
      { name: "General", href: `${base}/settings` },
      { name: "Build", href: `${base}/settings` },
      { name: "Environment", href: `${base}/env` },
      { name: "Domains", href: `${base}/domains` },
      { name: "Protection", href: `${base}/settings` },
      { name: "Webhooks", href: `${base}/settings` },
    ];
  }

  if (segments[0] === "deployments" && segments[1]) {
    const depBase = `${base}/deployments/${segments[1]}`;
    return [
      { name: "Overview", href: depBase },
      { name: "Logs", href: `${depBase}/logs` },
      { name: "Source", href: `${depBase}/source` },
      { name: "Functions", href: `${depBase}/functions` },
    ];
  }

  return [
    { name: "Overview", href: base },
    { name: "Deployments", href: `${base}/deployments` },
    { name: "Domains", href: `${base}/domains` },
    { name: "Env", href: `${base}/env` },
    { name: "Storage", href: `${base}/storage` },
    { name: "Logs", href: `${base}/logs` },
    { name: "Analytics", href: `${base}/analytics` },
    { name: "Settings", href: `${base}/settings` },
  ];
}

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const tabs = getProjectTabs(projectId, pathname);
  const base = `/dashboard/projects/${projectId}`;

  return (
    <div className="flex gap-6 mb-8 border-b border-border overflow-x-auto scrollbar-hidden">
      {tabs.map((tab, i) => {
        const exact = pathname === tab.href;
        const isOverview = tab.href === base && pathname === base;
        const isActive = i === 0 ? (exact || isOverview) : exact;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-3 text-sm whitespace-nowrap transition-colors ${
              isActive
                ? "border-b-2 border-text text-text font-medium"
                : "text-muted hover:text-text"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
