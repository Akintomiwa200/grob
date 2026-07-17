"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronsUpDown,
  ChevronDown,
  CheckCircle2,
  Folder,
  User,
  Settings,
  LogOut,
  CreditCard,
  Bell,
  Circle,
  LayoutDashboard,
  Globe,
  Shield,
  Zap,
  Image,
  GitBranch,
  Workflow,
  BarChart3,
  MessageSquare,
  Blocks,
} from "lucide-react";

type Project = { id: string; name: string };

const STATUS_OPTIONS = [
  { label: "Online", value: "online", color: "#3DDC97" },
  { label: "Appear Offline", value: "offline", color: "#8B92A4" },
];

const APP_GRID = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Projects", icon: Folder, href: "/dashboard/projects" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Deployments", icon: GitBranch, href: "/dashboard/deployments" },
  { label: "Firewall", icon: Shield, href: "/dashboard" },
  { label: "CDN", icon: Globe, href: "/dashboard" },
  { label: "AI Gateway", icon: Zap, href: "/dashboard" },
  { label: "Workflows", icon: Workflow, href: "/dashboard" },
  { label: "Images", icon: Image, href: "/dashboard" },
];

const USER_MENU_ITEMS = [
  { label: "Profile", icon: User, href: "/dashboard/profile" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { label: "Billing", icon: CreditCard, href: "/dashboard/settings" },
];

export default function Navbar({
  userName,
  userImage,
  projects,
  initialStatus,
}: {
  userName?: string | null;
  userImage?: string | null;
  projects: Project[];
  initialStatus?: "online" | "offline";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [appsOpen, setAppsOpen] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"online" | "offline">(initialStatus || "online");
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: string; link: string | null; read: boolean; createdAt: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) setSwitcherOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) setAppsOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setStatusOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch persisted status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/user/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
        }
      } catch {}
      setStatusLoaded(true);
    }
    fetchStatus();
  }, []);

  // Poll notifications
  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch {}
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll status every 15s to stay in sync
  useEffect(() => {
    if (!statusLoaded) return;
    async function pollStatus() {
      try {
        const res = await fetch("/api/user/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
        }
      } catch {}
    }
    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, [statusLoaded]);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", id }),
    });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const segments = pathname.split("/").filter(Boolean);
  const projectId = segments[1] === "projects" ? segments[2] : undefined;
  const deploymentId = segments[3] === "deployments" ? segments[4] : undefined;

  const currentProject = projects.find((p) => p.id === projectId);
  const breadcrumbLabel = currentProject?.name || "Select project";
  const breadcrumbInitial = currentProject ? breadcrumbLabel.charAt(0).toUpperCase() : "?";
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status)!;

  return (
    <header className="hidden h-14 shrink-0 items-center justify-between bg-bg px-6 md:flex">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        {/* Project switcher */}
        <div className="relative" ref={switcherRef}>
          <button
            type="button"
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-white/[0.05]"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${currentProject ? "bg-[#6E5BFF]" : "bg-white/10"}`}>
              {breadcrumbInitial}
            </span>
            <span className={`font-medium ${currentProject ? "text-[#E7E9EE]" : "text-[#8B92A4]"}`}>
              {breadcrumbLabel}
            </span>
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

      <div className="flex shrink-0 items-center gap-1 text-sm text-[#8B92A4]">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5FA2] px-1 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-[#212633] bg-[#12151D] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#212633]">
                <p className="text-sm font-medium text-[#E7E9EE]">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#6E5BFF] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-6 h-6 text-[#8B92A4] mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-[#8B92A4]">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) markRead(n.id); if (n.link) { setNotifOpen(false); router.push(n.link); } }}
                      className={`flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-[#212633]/50 cursor-pointer ${!n.read ? "bg-white/[0.02]" : ""}`}
                    >
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-[#6E5BFF]" : "bg-transparent"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#E7E9EE]">{n.title}</p>
                        <p className="text-xs text-[#8B92A4] truncate">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-[#8B92A4] whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <Link
                  href="/dashboard"
                  onClick={() => setNotifOpen(false)}
                  className="block text-center py-2.5 text-xs text-[#6E5BFF] hover:bg-white/[0.03] border-t border-[#212633]"
                >
                  View all notifications
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/[0.05] transition-colors"
          >
            <Circle className="h-2.5 w-2.5 shrink-0" style={{ fill: currentStatus.color, color: currentStatus.color }} />
            <span className="text-xs text-[#8B92A4]">{currentStatus.label}</span>
            <ChevronDown className={`h-3 w-3 text-[#8B92A4] transition-transform ${statusOpen ? "rotate-180" : ""}`} />
          </button>

          {statusOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-[#212633] bg-[#12151D] p-1 shadow-2xl">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const newStatus = opt.value as "online" | "offline";
                    setStatus(newStatus);
                    setStatusOpen(false);
                    fetch("/api/user/status", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: newStatus }),
                    }).catch(() => {});
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    status === opt.value
                      ? "bg-white/[0.05] text-[#E7E9EE]"
                      : "text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE]"
                  }`}
                >
                  <Circle className="h-2.5 w-2.5 shrink-0" style={{ fill: opt.color, color: opt.color }} />
                  {opt.label}
                  {status === opt.value && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-[#6E5BFF]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apps grid (Google-style) */}
        <div className="relative" ref={appsRef}>
          <button
            type="button"
            onClick={() => setAppsOpen(!appsOpen)}
            className="rounded-lg p-2 hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
            title="Apps"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="3" r="1.5" />
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="13" cy="3" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
              <circle cx="3" cy="13" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
              <circle cx="13" cy="13" r="1.5" />
            </svg>
          </button>

          {appsOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-[#212633] bg-[#12151D] p-3 shadow-2xl">
              <p className="text-[10px] uppercase tracking-wider text-[#8B92A4] font-medium mb-2 px-1">Apps</p>
              <div className="grid grid-cols-3 gap-1">
                {APP_GRID.map((app) => (
                  <Link
                    key={app.label}
                    href={app.href}
                    onClick={() => setAppsOpen(false)}
                    className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                      <app.icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{app.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-[#212633]" />

        {/* User avatar dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 rounded-full p-0.5 hover:ring-1 hover:ring-white/10 transition-all"
          >
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5FA2] to-[#6E5BFF] text-[11px] font-semibold text-white">
                {(userName || "U").charAt(0).toUpperCase()}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 text-[#8B92A4] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-[#212633] bg-[#12151D] p-1 shadow-2xl">
              {/* User info */}
              <div className="px-3 py-2 mb-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#E7E9EE]">{userName || "User"}</p>
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#6E5BFF]/30 bg-[#6E5BFF]/10 text-[#6E5BFF]">
                    Free
                  </span>
                </div>
                <p className="text-xs text-[#8B92A4] truncate">Account</p>
              </div>
              <div className="my-1 border-t border-[#212633]" />

              {/* Menu items */}
              {USER_MENU_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}

              <div className="my-1 border-t border-[#212633]" />

              <button
                type="button"
                onClick={async () => {
                  setUserMenuOpen(false);
                  await fetch("/api/auth/signout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#FF5FA2] hover:bg-[#FF5FA2]/10 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
