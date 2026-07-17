"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, X, Terminal, GitBranch, Globe, LayoutTemplate, Sliders, Database, Network, Cpu, FileText, Shield, Play } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

const DOCS_PAGES = [
  { title: "Introduction", path: "/docs", category: "Getting Started", icon: FileText, desc: "Welcome to Grob and deployment overview." },
  { title: "Quickstart", path: "/docs/quickstart", category: "Getting Started", icon: Terminal, desc: "Deploy your first app in under three minutes." },
  { title: "Frameworks & Languages", path: "/docs/frameworks", category: "Getting Started", icon: LayoutTemplate, desc: "Optimized configurations for frontend and backend languages." },
  { title: "Git Integration", path: "/docs/git", category: "Deploying", icon: GitBranch, desc: "Automatic preview & production builds on git push." },
  { title: "Builds", path: "/docs/builds", category: "Deploying", icon: Cpu, desc: "Customize compiler commands and output dirs." },
  { title: "Environment Variables", path: "/docs/env-vars", category: "Deploying", icon: Sliders, desc: "Securely manage project secrets and injection." },
  { title: "Custom Domains", path: "/docs/domains", category: "Deploying", icon: Globe, desc: "Assign domains with automatic Let's Encrypt SSL." },
  { title: "Regions", path: "/docs/regions", category: "Edge Network", icon: Network, desc: "Deploy functions and cache closer to users." },
  { title: "Caching", path: "/docs/caching", category: "Edge Network", icon: Database, desc: "Configure Edge CDN and cache invalidation rules." },
  { title: "Serverless Functions", path: "/docs/serverless", category: "Features", icon: Terminal, desc: "Deploy serverless backend APIs in Node, Go, Python." },
  { title: "Storage Buckets", path: "/docs/storage", category: "Features", icon: Database, desc: "Manage asset blobs and public/private object buckets." },
  { title: "AI Gateway", path: "/docs/ai-gateway", category: "Features", icon: Cpu, desc: "Smart route, secure, cache, and trace LLM prompts." },
  { title: "Firewall & Security", path: "/docs/firewall", category: "Features", icon: Shield, desc: "Configure custom CIDR blocks and WAF shields." },
  { title: "Workflows & Actions", path: "/docs/workflows", category: "Features", icon: Play, desc: "Configure automated pipeline actions and checks." },
  { title: "Image Optimization", path: "/docs/image-optimization", category: "Features", icon: Globe, desc: "Scale, transform, and compress images on the fly." }
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter docs pages based on search query
  const searchResults = searchQuery.trim() === ""
    ? []
    : DOCS_PAGES.filter(
        (page) =>
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-accent/10 text-accent font-semibold"
        : "text-muted hover:bg-surface hover:text-text"
    }`;
  };

  const SidebarContent = () => (
    <nav className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-muted/80">Getting Started</h4>
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/docs" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs")}>
              <FileText className="h-4.5 w-4.5" />
              <span>Introduction</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/quickstart" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/quickstart")}>
              <Terminal className="h-4.5 w-4.5" />
              <span>Quickstart</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/frameworks" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/frameworks")}>
              <LayoutTemplate className="h-4.5 w-4.5" />
              <span>Frameworks & Languages</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div>
        <h4 className="mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-muted/80">Deploying</h4>
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/docs/git" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/git")}>
              <GitBranch className="h-4.5 w-4.5" />
              <span>Git Integration</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/builds" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/builds")}>
              <Cpu className="h-4.5 w-4.5" />
              <span>Builds</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/env-vars" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/env-vars")}>
              <Sliders className="h-4.5 w-4.5" />
              <span>Environment Variables</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/domains" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/domains")}>
              <Globe className="h-4.5 w-4.5" />
              <span>Custom Domains</span>
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-muted/80">Features</h4>
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/docs/serverless" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/serverless")}>
              <Terminal className="h-4.5 w-4.5" />
              <span>Serverless Functions</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/storage" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/storage")}>
              <Database className="h-4.5 w-4.5" />
              <span>Storage Buckets</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/ai-gateway" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/ai-gateway")}>
              <Cpu className="h-4.5 w-4.5" />
              <span>AI Gateway</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/firewall" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/firewall")}>
              <Shield className="h-4.5 w-4.5" />
              <span>Firewall & Security</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/workflows" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/workflows")}>
              <Play className="h-4.5 w-4.5 animate-pulse" />
              <span>Workflows & Actions</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/image-optimization" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/image-optimization")}>
              <Globe className="h-4.5 w-4.5" />
              <span>Image Optimization</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div>
        <h4 className="mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-muted/80">Edge Network</h4>
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/docs/regions" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/regions")}>
              <Network className="h-4.5 w-4.5" />
              <span>Regions</span>
            </Link>
          </li>
          <li>
            <Link href="/docs/caching" onClick={() => setMobileOpen(false)} className={getLinkClass("/docs/caching")}>
              <Database className="h-4.5 w-4.5" />
              <span>Caching</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg font-[Inter,sans-serif] text-text flex flex-col antialiased">
      {/* Top Nav */}
      <PublicNavbar />

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto relative">
        {/* Left Sidebar (Desktop) */}
        <aside className="sidebar-scroll hidden w-64 shrink-0 overflow-y-auto border-r border-border py-8 pl-4 pr-6 md:block lg:pl-8">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-text transition-colors md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Menu
          </button>
          <SidebarContent />
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 top-16 z-30 flex md:hidden bg-bg/95 backdrop-blur-md transition-all duration-300">
            <aside className="w-full overflow-y-auto py-6 px-6">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-8 px-5 sm:px-8 lg:px-12">
          {children}
        </main>
      </div>

      {/* Interactive Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 sm:pt-20 bg-bg/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl transition-all">
            <div className="flex items-center border-b border-border px-4 py-3">
              <Search className="h-5 w-5 text-muted mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-text placeholder-muted text-base focus:outline-none"
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded hover:bg-bg text-muted hover:text-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto p-2">
              {searchQuery.trim() === "" ? (
                <div className="py-6 text-center text-sm text-muted">
                  Type a query to search the docs (e.g. <code className="bg-bg px-1 py-0.5 rounded text-accent">caching</code>, <code className="bg-bg px-1 py-0.5 rounded text-accent">serverless</code>)
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {searchResults.map((result) => {
                    const ResultIcon = result.icon;
                    return (
                      <Link
                        key={result.path}
                        href={result.path}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 hover:text-accent group transition-all"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg group-hover:bg-accent/10 transition-colors shrink-0">
                          <ResultIcon className="h-4.5 w-4.5 text-text group-hover:text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-text group-hover:text-accent">{result.title}</span>
                            <span className="text-[10px] font-bold text-muted/60 uppercase tracking-wider">{result.category}</span>
                          </div>
                          <p className="text-xs text-muted mt-0.5 truncate">{result.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted/80 bg-bg/40 font-medium">
              <span>Press <kbd className="font-mono bg-bg border border-border px-1 py-0.5 rounded">Esc</kbd> to close</span>
              <span>Matches: {searchResults.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
