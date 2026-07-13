"use client";

/**
 * Sidebar — dashboard navigation
 *
 * Matches the reference layout: workspace switcher, search, grouped nav
 * with icons/badges/disclosure chevrons, and an account row pinned to
 * the bottom. Active state is derived from the current pathname.
 *
 * Dependencies: lucide-react
 */

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

type SidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan?: string;
};

export default function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
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

  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-[#212633] bg-[#0B0E14] text-[#E7E9EE]">
      {/* Workspace switcher */}
      <div className="relative" ref={switcherRef}>
        <button
          type="button"
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className="flex h-14 w-full items-center gap-2 border-b border-[#212633] px-4 text-left hover:bg-white/[0.03]"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6E5BFF] to-[#8F7CFF] text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {user.name || "Account"}
          </span>
          <span className="rounded-full border border-[#212633] bg-[#12151D] px-2 py-0.5 text-[11px] font-medium text-[#8B92A4]">
            {user.plan ?? "Hobby"}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#8B92A4]" />
        </button>

        {isSwitcherOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-b border-[#212633] bg-[#12151D] p-1 shadow-2xl">
            <div className="px-3 py-2 mb-1">
              <p className="text-[10px] uppercase tracking-wider text-[#8B92A4] font-medium">Account</p>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.05]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6E5BFF] to-[#8F7CFF] text-xs font-semibold text-white">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#E7E9EE] truncate">{user.name || "Account"}</p>
                <p className="text-xs text-[#8B92A4] truncate">{user.email}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[#6E5BFF] shrink-0" />
            </div>
            <div className="my-1 border-t border-[#212633]" />
            <Link
              href="/login"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
              onClick={() => setIsSwitcherOpen(false)}
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
          className="flex w-full items-center gap-2 rounded-lg border border-[#212633] bg-[#12151D] px-3 py-2 text-sm text-[#8B92A4] hover:border-[#2C3140]"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <span className="flex-1 text-left">Find…</span>
          <kbd className="rounded border border-[#212633] bg-[#0B0E14] px-1.5 py-0.5 font-mono text-[11px] text-[#8B92A4]">
            F
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={i} className="mb-3">
            <div className="space-y-0.5">
              {group.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-sm transition-colors ${
                      active
                        ? "bg-white/[0.08] font-medium text-[#E7E9EE]"
                        : "text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE]"
                    }`}
                  >
                    <item.icon
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.75}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-[#6E5BFF]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#8F7CFF]">
                        {item.badge}
                      </span>
                    )}
                    {item.chevron && <span className="text-[#8B92A4]">›</span>}
                  </Link>
                );
              })}
            </div>
            {i < NAV_GROUPS.length - 1 && (
              <div className="my-3 h-px bg-[#212633]" />
            )}
          </div>
        ))}
      </nav>

      {/* Account row */}
      <div className="flex items-center gap-3 border-t border-[#212633] px-4 py-3 relative" ref={menuRef}>
        {/* Drop-up Menu */}
        {isMenuOpen && (
          <div className="absolute bottom-14 left-4 right-4 rounded-xl border border-[#212633] bg-[#12151D] p-1 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
             <div className="px-3 py-2 border-b border-[#212633] mb-1">
                <p className="text-sm font-medium text-[#E7E9EE] truncate">{user.name || "Account"}</p>
                <p className="text-xs text-[#8B92A4] truncate">{user.email}</p>
             </div>
             
             <Link 
               href="/dashboard/profile"
               className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#E7E9EE] hover:bg-white/[0.05] transition-colors"
               onClick={() => setIsMenuOpen(false)}
             >
               <UserIcon className="h-4 w-4 text-[#8B92A4]" />
               Profile
             </Link>
             
             <Link 
               href="/dashboard/settings"
               className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#E7E9EE] hover:bg-white/[0.05] transition-colors"
               onClick={() => setIsMenuOpen(false)}
             >
               <Settings className="h-4 w-4 text-[#8B92A4]" />
               Settings
             </Link>
             
             <div className="my-1 border-t border-[#212633]" />
             
             <button
               onClick={() => {
                 setIsMenuOpen(false);
                 signOut({ callbackUrl: "/" });
               }}
               className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#FF5F57] hover:bg-[#FF5F57]/10 transition-colors"
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
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5FA2] to-[#6E5BFF] text-xs font-semibold text-white">
            {initial}
          </span>
        )}
        <span className="flex-1 truncate text-sm text-[#E7E9EE]">
          {user.name || user.email || "Account"}
        </span>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="More options"
          className="rounded-md p-1 text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md p-1 text-[#8B92A4] hover:bg-white/[0.05] hover:text-[#E7E9EE] transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
