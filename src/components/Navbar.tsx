"use client";

/**
 * Navbar — top breadcrumb bar (org → project → deployment).
 *
 * The dashboard layout is a single top-level layout, so it doesn't get
 * dynamic [id]/[deploymentId] route params the way a page.tsx would. This
 * component reads them out of the pathname instead and fetches the real
 * names/status from /api/breadcrumb, so the bar updates correctly as you
 * navigate between /dashboard, a project, and a specific deployment —
 * no hardcoded "new-homepage" anywhere.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronsUpDown, MoreHorizontal } from "lucide-react";

type Breadcrumb = {
  orgName: string;
  orgImage?: string | null;
  projectName?: string;
  deploymentShortId?: string;
  visibility?: string;
};

const RIGHT_LINKS = [
  { label: "Feedback", href: "https://vercel.com/feedback" },
  { label: "Blog", href: "https://vercel.com/blog" },
  { label: "Support", href: "https://vercel.com/support" },
  { label: "Docs", href: "https://vercel.com/docs" },
];

export default function Navbar({
  userName,
  userImage,
}: {
  userName?: string | null;
  userImage?: string | null;
}) {
  const pathname = usePathname();
  const [data, setData] = useState<Breadcrumb | null>(null);

  const segments = pathname.split("/").filter(Boolean);
  // ["dashboard", "projects", ":id", "deployments", ":deploymentId", ...]
  const projectId = segments[1] === "projects" ? segments[2] : undefined;
  const deploymentId = segments[3] === "deployments" ? segments[4] : undefined;

  useEffect(() => {
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    if (deploymentId) params.set("deploymentId", deploymentId);

    let cancelled = false;
    fetch(`/api/breadcrumb?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, deploymentId]);

  const orgName = data?.orgName ?? userName ?? "Account";
  const displayInitial = (
    data?.orgName
      ? data.orgName.charAt(0)
      : (userName || "Account").charAt(0)
  ).toUpperCase();
  const currentProject = projectId ? data?.projectName : null;
  const breadcrumbLabel = currentProject || orgName;
  const breadcrumbInitial = currentProject
    ? currentProject.charAt(0).toUpperCase()
    : displayInitial;

  return (
    <header className="hidden h-14 shrink-0 items-center justify-between bg-[#0B0E14] px-6 md:flex">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-white/[0.05]"
        >
          {data?.orgImage && !currentProject ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.orgImage} alt="" className="h-5 w-5 rounded-full" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6E5BFF] text-[10px] font-bold text-white">
              {breadcrumbInitial}
            </span>
          )}
          <span className="font-medium text-[#E7E9EE]">{breadcrumbLabel}</span>
          <ChevronsUpDown className="h-3 w-3 text-[#8B92A4]" />
        </button>

        {currentProject && data?.projectName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8B92A4]" />
            <Link
              href={`/dashboard/projects`}
              className="truncate rounded-md px-2 py-1.5 text-muted hover:bg-white/[0.05] hover:text-text"
            >
              All Projects
            </Link>
          </>
        )}

        {deploymentId && data?.deploymentShortId && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8B92A4]" />
            <span className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <span className="flex items-center gap-1.5 font-mono text-xs text-[#8B92A4]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
                {data.deploymentShortId}
              </span>
              {data.visibility && (
                <span className="rounded-full bg-[#212633] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#8B92A4]">
                  {data.visibility}
                </span>
              )}
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
