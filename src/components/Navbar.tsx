"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
  CheckCircle2,
  Folder,
} from "lucide-react";

type Project = { id: string; name: string };

const RIGHT_LINKS = [
  { label: "Feedback", href: "/dashboard/support" },
  { label: "Blog", href: "/dashboard" },
  { label: "Support", href: "/dashboard/support" },
  { label: "Docs", href: "/dashboard/support" },
];

export default function Navbar({
  userName,
  userImage,
  projects,
}: {
  userName?: string | null;
  userImage?: string | null;
  projects: Project[];
}) {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const projectId = segments[1] === "projects" ? segments[2] : undefined;
  const deploymentId = segments[3] === "deployments" ? segments[4] : undefined;

  const currentProject = projects.find((p) => p.id === projectId);
  const breadcrumbLabel = currentProject?.name || userName || "Projects";
  const breadcrumbInitial = breadcrumbLabel.charAt(0).toUpperCase();

  return (
    <header className="hidden h-14 shrink-0 items-center justify-between bg-[#0B0E14] px-6 md:flex">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {/* Project switcher */}
        <div className="relative" ref={switcherRef}>
          <button
            type="button"
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-white/[0.05]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6E5BFF] text-[10px] font-bold text-white">
              {breadcrumbInitial}
            </span>
            <span className="font-medium text-[#E7E9EE]">{breadcrumbLabel}</span>
            <ChevronsUpDown className="h-3 w-3 text-[#8B92A4]" />
          </button>

          {switcherOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-[#212633] bg-[#12151D] p-1 shadow-2xl">
              <div className="px-3 py-2 mb-1">
                <p className="text-[10px] uppercase tracking-wider text-[#8B92A4] font-medium">Projects</p>
              </div>
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[#8B92A4]">No projects yet</div>
              ) : (
                projects.map((p) => {
                  const isActive = p.id === projectId;
                  return (
                    <Link
                      key={p.id}
                      href={`/dashboard/projects/${p.id}`}
                      onClick={() => setSwitcherOpen(false)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-white/[0.05] text-[#E7E9EE]"
                          : "text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE]"
                      }`}
                    >
                      <Folder className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{p.name}</span>
                      {isActive && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6E5BFF]" />}
                    </Link>
                  );
                })
              )}
              <div className="my-1 border-t border-[#212633]" />
              <Link
                href="/dashboard/projects/new"
                onClick={() => setSwitcherOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
              >
                + New Project
              </Link>
            </div>
          )}
        </div>

        {currentProject && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8B92A4]" />
            <Link
              href="/dashboard/projects"
              className="truncate rounded-md px-2 py-1.5 text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE]"
            >
              All Projects
            </Link>
          </>
        )}

        {deploymentId && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8B92A4]" />
            <span className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-xs text-[#8B92A4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
              {deploymentId.slice(0, 8)}
            </span>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-5 text-sm text-[#8B92A4]">
        {RIGHT_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#E7E9EE]"
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          aria-label="More"
          className="rounded-md p-1 hover:bg-white/[0.05] hover:text-[#E7E9EE]"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {userImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={userImage} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5FA2] to-[#6E5BFF] text-[10px] font-semibold text-white">
            {(userName || "U").charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </header>
  );
}
