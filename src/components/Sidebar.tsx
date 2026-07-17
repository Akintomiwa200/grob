"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Box,
  ScrollText,
  LineChart,
  Gauge,
  Eye,
  ShieldHalf,
  Globe,
  Variable,
  Globe2,
  Cable,
  Blocks,
  Database,
  Flag,
  Bot,
  Share2,
  Boxes,
  Workflow,
  Images,
  PieChart,
  CircleHelp,
  ChevronsUpDown,
  CheckCircle2,
  Search,
  MoreHorizontal,
  Bell,
  LogOut,
  Settings,
  User as UserIcon,
  Plus,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: "Beta";
  chevron?: boolean;
};

const NAV_GROUPS: NavItem[][] = [
  [
    { label: "Projects", href: "/dashboard", icon: LayoutGrid },
    { label: "Deployments", href: "/dashboard/deployments", icon: Box },
    { label: "Logs", href: "/dashboard/logs", icon: ScrollText },
    { label: "Analytics", href: "/dashboard/analytics", icon: LineChart },
    { label: "Speed Insights", href: "/dashboard/speed-insights", icon: Gauge },
    {
      label: "Observability",
      href: "/dashboard/observability",
      icon: Eye,
      chevron: true,
    },
    { label: "Firewall", href: "/dashboard/firewall", icon: ShieldHalf },
    { label: "CDN", href: "/dashboard/cdn", icon: Globe },
  ],
  [
    { label: "Environment Variables", href: "/dashboard/env", icon: Variable },
    { label: "Domains", href: "/dashboard/domains", icon: Globe2 },
    {
      label: "Connect",
      href: "/dashboard/connect",
      icon: Cable,
      badge: "Beta",
    },
    { label: "Integrations", href: "/dashboard/integrations", icon: Blocks },
    { label: "Storage", href: "/dashboard/storage", icon: Database },
    { label: "Flags", href: "/dashboard/flags", icon: Flag },
    { label: "Agent", href: "/dashboard/agent", icon: Bot, chevron: true },
    {
      label: "AI Gateway",
      href: "/dashboard/ai-gateway",
      icon: Share2,
      chevron: true,
    },
    {
      label: "Sandboxes",
      href: "/dashboard/sandboxes",
      icon: Boxes,
      chevron: true,
    },
    { label: "Workflows", href: "/dashboard/workflows", icon: Workflow },
    { label: "Images", href: "/dashboard/images", icon: Images, badge: "Beta" },
  ],
  [
    { label: "Usage", href: "/dashboard/usage", icon: PieChart },
    { label: "Support", href: "/dashboard/support", icon: CircleHelp },
  ],
];

const PROJECT_SCOPED = new Set([
  "/dashboard/deployments",
  "/dashboard/logs",
  "/dashboard/analytics",
  "/dashboard/speed-insights",
  "/dashboard/observability",
  "/dashboard/firewall",
  "/dashboard/cdn",
  "/dashboard/env",
  "/dashboard/domains",
  "/dashboard/connect",
  "/dashboard/integrations",
  "/dashboard/storage",
  "/dashboard/flags",
  "/dashboard/agent",
  "/dashboard/ai-gateway",
  "/dashboard/sandboxes",
  "/dashboard/workflows",
  "/dashboard/images",
  "/dashboard/usage",
]);

type SidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan?: string;
};

function SidebarNav({
  user,
  pathname,
  onNavigate,
}: {
  user: SidebarUser;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" || pathname.startsWith("/dashboard/projects")
      );
    }
    return pathname.startsWith(href);
  }

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;

  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <>
      {/* Workspace switcher */}
      <div className="relative" ref={switcherRef}>
        <button
          type="button"
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className="flex h-14 w-full items-center gap-2 border-b border-border px-4 text-left hover:bg-white/[0.03]"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
            {user.name || "Account"}
          </span>
          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
            {user.plan ?? "Hobby"}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
        </button>

        {isSwitcherOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-b border-border bg-surface p-1 shadow-2xl">
            <div className="px-3 py-2 mb-1">
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Account</p>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.05]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-xs font-semibold text-white">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">{user.name || "Account"}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
            </div>
            <div className="my-1 border-t border-border" />
            <Link
              href="/login"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/[0.05] hover:text-text transition-colors"
              onClick={() => { setIsSwitcherOpen(false); onNavigate?.(); }}
            >
              <Plus className="h-4 w-4" />
              Add account
            </Link>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted hover:border-border/80"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <span className="flex-1 text-left">Find…</span>
          <kbd className="rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[11px] text-muted">
            F
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={i} className="mb-3">
            <div className="space-y-0.5">
              {group.map((item, j) => {
                const isFirstChild = i === 0 && j === 0;
                const label = isFirstChild && activeProjectId ? "Overview" : item.label;
                let href = item.href;
                if (isFirstChild && activeProjectId) {
                  href = `/dashboard/projects/${activeProjectId}`;
                } else if (activeProjectId && PROJECT_SCOPED.has(item.href)) {
                  href = `/dashboard/projects/${activeProjectId}${item.href.replace("/dashboard", "")}`;
                }
                const active = isActive(href) && !(isFirstChild && !activeProjectId && pathname.startsWith("/dashboard/projects"));
                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-sm transition-colors ${
                      active
                        ? "bg-white/[0.08] font-medium text-text"
                        : "text-muted hover:bg-white/[0.05] hover:text-text"
                    }`}
                  >
                    <item.icon
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        {item.badge}
                      </span>
                    )}
                    {item.chevron && <span className="text-muted">›</span>}
                  </Link>
                );
              })}
            </div>
            {i < NAV_GROUPS.length - 1 && (
              <div className="my-3" />
            )}
          </div>
        ))}
      </nav>

      {/* Account row */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-3 relative" ref={menuRef}>
        {isMenuOpen && (
          <div className="absolute bottom-14 left-4 right-4 rounded-xl border border-border bg-surface p-1 shadow-2xl z-50">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-sm font-medium text-text truncate">{user.name || "Account"}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>

            <Link
              href="/dashboard/profile"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-white/[0.05] transition-colors"
              onClick={() => { setIsMenuOpen(false); onNavigate?.(); }}
            >
              <UserIcon className="h-4 w-4 text-muted" />
              Profile
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-white/[0.05] transition-colors"
              onClick={() => { setIsMenuOpen(false); onNavigate?.(); }}
            >
              <Settings className="h-4 w-4 text-muted" />
              Settings
            </Link>

            <div className="my-1 border-t border-border" />

            <button
              onClick={() => {
                setIsMenuOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}

        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-xs font-semibold text-white">
            {initial}
          </span>
        )}
        <span className="flex-1 truncate text-sm text-text">
          {user.name || user.email || "Account"}
        </span>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="More options"
          className="rounded-md p-1 text-muted hover:bg-white/[0.05] hover:text-text transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-1 text-muted hover:bg-white/[0.05] hover:text-text transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  user,
  mobileOpen,
  onMobileClose,
}: {
  user: SidebarUser;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-bg text-text shrink-0">
        <SidebarNav user={user} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />

          {/* Drawer panel */}
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-bg text-text" style={{ animation: "slideInLeft 200ms ease-out" }}>
            {/* Close button */}
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-sm font-semibold text-text">Menu</span>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-md p-1.5 text-muted hover:bg-white/[0.05] hover:text-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarNav
              user={user}
              pathname={pathname}
              onNavigate={onMobileClose}
            />
          </aside>
        </div>
      )}
    </>
  );
}

export function SidebarToggle({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors md:hidden"
      aria-label="Toggle menu"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0" y1="3" x2="18" y2="3"
          stroke="var(--text)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transition: "all 300ms cubic-bezier(0.4,0,0.2,1)",
            transformOrigin: "center",
            transform: isOpen ? "translate(0, 6px) rotate(45deg)" : "none",
          }}
        />
        <line
          x1="0" y1="9" x2="18" y2="9"
          stroke="var(--text)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transition: "all 300ms cubic-bezier(0.4,0,0.2,1)",
            opacity: isOpen ? 0 : 1,
          }}
        />
        <line
          x1="0" y1="15" x2="18" y2="15"
          stroke="var(--text)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transition: "all 300ms cubic-bezier(0.4,0,0.2,1)",
            transformOrigin: "center",
            transform: isOpen ? "translate(0, -6px) rotate(-45deg)" : "none",
          }}
        />
      </svg>
    </button>
  );
}
