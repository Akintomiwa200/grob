"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar, { SidebarToggle } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import type { Session } from "next-auth";

type Project = { id: string; name: string };

export default function DashboardClient({
  session,
  projects,
  userStatus,
  children,
}: {
  session: Session;
  projects: Project[];
  userStatus: "online" | "offline";
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Toaster position="top-right" theme="dark" richColors />
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
        }}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 shrink-0 items-center gap-3 px-4 md:hidden">
          <SidebarToggle onClick={() => setMobileOpen(!mobileOpen)} isOpen={mobileOpen} />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold text-text"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
              <span className="text-xs font-bold text-white">G</span>
            </div>
            Grob
          </Link>
        </header>

        <Navbar
          userName={session.user?.name}
          userImage={session.user?.image}
          projects={projects}
          initialStatus={userStatus}
        />

        <main className="sidebar-scroll flex-1 overflow-y-auto p-4 md:p-6 text-text">
          {children}
        </main>
      </div>
    </div>
  );
}
