import Link from "next/link";
import { Search } from "lucide-react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg font-[Inter,sans-serif] text-text flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="font-[Space_Grotesk,sans-serif] text-sm font-bold text-white">
                  G
                </span>
              </div>
              <span className="font-[Space_Grotesk,sans-serif] text-xl font-bold">
                Grob
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/docs" className="text-text font-medium">Docs</Link>
              <Link href="/login" className="text-muted hover:text-text transition-colors">API Reference</Link>
              <Link href="/login" className="text-muted hover:text-text transition-colors">Help</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search documentation..." 
                className="h-9 w-64 rounded-md border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded border border-border bg-bg px-1.5 py-0.5 text-[10px] font-medium text-muted">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </div>
            
            <Link
              href="/login"
              className="text-sm font-medium text-muted transition-colors hover:text-text"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-text px-3 py-1.5 text-sm font-medium text-bg transition-colors hover:brightness-110"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto">
        {/* Left Sidebar */}
        <aside className="sidebar-scroll hidden w-64 shrink-0 overflow-y-auto border-r border-border py-8 pl-4 pr-6 md:block lg:pl-8">
          <nav className="flex flex-col gap-6">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">Getting Started</h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href="/docs" className="text-sm text-accent font-medium">Introduction</Link>
                </li>
                <li>
                  <Link href="/docs/quickstart" className="text-sm text-muted hover:text-text transition-colors">Quickstart</Link>
                </li>
                <li>
                  <Link href="/docs/frameworks" className="text-sm text-muted hover:text-text transition-colors">Frameworks</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">Deploying</h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href="/docs/git" className="text-sm text-muted hover:text-text transition-colors">Git Integration</Link>
                </li>
                <li>
                  <Link href="/docs/builds" className="text-sm text-muted hover:text-text transition-colors">Builds</Link>
                </li>
                <li>
                  <Link href="/docs/env-vars" className="text-sm text-muted hover:text-text transition-colors">Environment Variables</Link>
                </li>
                <li>
                  <Link href="/docs/domains" className="text-sm text-muted hover:text-text transition-colors">Custom Domains</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">Edge Network</h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href="/docs/regions" className="text-sm text-muted hover:text-text transition-colors">Regions</Link>
                </li>
                <li>
                  <Link href="/docs/caching" className="text-sm text-muted hover:text-text transition-colors">Caching</Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-8 px-6 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
