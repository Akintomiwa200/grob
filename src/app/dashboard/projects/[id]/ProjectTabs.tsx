"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Deployments", path: "" },
    { name: "Domains", path: "/domains" },
    { name: "Functions", path: "/functions" },
    { name: "Collaborators", path: "/collaborators" },
    { name: "Notifications", path: "/notifications" },
    { name: "Redirects", path: "/redirects" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex gap-6 mb-8 border-b border-border overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const href = `/dashboard/projects/${projectId}${tab.path}`;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.name}
            href={href}
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
