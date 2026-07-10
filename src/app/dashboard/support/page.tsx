import { Search, Book, CreditCard, Puzzle, Code, MessageSquare, Ticket, ArrowRight, LifeBuoy, FileText, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl pb-12">
      {/* Header & Search */}
      <div className="relative mb-12 overflow-hidden rounded-2xl border border-border bg-surface/30 px-6 py-12 text-center md:px-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-blue-500/5" />
        <div className="relative z-10 mx-auto max-w-2xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 shadow-[0_0_30px_rgba(110,91,255,0.2)]">
            <LifeBuoy className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">How can we help?</h1>
          <p className="text-muted text-base md:text-lg">Search our knowledge base or get in touch with our support team.</p>
          
          <div className="relative mx-auto max-w-xl group mt-8">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-accent to-blue-500 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex items-center rounded-xl border border-border bg-[#0B0E14] px-4 py-3 shadow-lg transition-colors focus-within:border-accent">
              <Search className="h-5 w-5 text-muted" />
              <input 
                type="text" 
                placeholder="Search documentation, guides, or API reference..." 
                className="w-full bg-transparent px-3 py-1 text-sm text-text placeholder-muted/60 focus:outline-none"
              />
              <button className="hidden sm:block rounded-lg bg-white/5 px-3 py-1 text-xs font-medium text-text transition-colors hover:bg-white/10 border border-border">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Help Categories */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-text">Browse Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="#" className="group flex flex-col justify-between rounded-xl border border-border bg-surface/20 p-5 transition-all hover:border-accent/50 hover:bg-surface/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-border group-hover:bg-accent/10 transition-colors">
                <Book className="h-5 w-5 text-text group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text group-hover:text-accent transition-colors">Getting Started</h3>
                <p className="text-sm text-muted">Learn the basics of setting up and deploying your first project.</p>
              </div>
            </Link>
            
            <Link href="#" className="group flex flex-col justify-between rounded-xl border border-border bg-surface/20 p-5 transition-all hover:border-accent/50 hover:bg-surface/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-border group-hover:bg-accent/10 transition-colors">
                <CreditCard className="h-5 w-5 text-text group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text group-hover:text-accent transition-colors">Billing & Plans</h3>
                <p className="text-sm text-muted">Manage your subscription, invoices, and payment methods.</p>
              </div>
            </Link>

            <Link href="#" className="group flex flex-col justify-between rounded-xl border border-border bg-surface/20 p-5 transition-all hover:border-accent/50 hover:bg-surface/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-border group-hover:bg-accent/10 transition-colors">
                <Puzzle className="h-5 w-5 text-text group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text group-hover:text-accent transition-colors">Integrations</h3>
                <p className="text-sm text-muted">Connect Grob with GitHub, Slack, and other third-party tools.</p>
              </div>
            </Link>

            <Link href="#" className="group flex flex-col justify-between rounded-xl border border-border bg-surface/20 p-5 transition-all hover:border-accent/50 hover:bg-surface/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-border group-hover:bg-accent/10 transition-colors">
                <Code className="h-5 w-5 text-text group-hover:text-accent transition-colors" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-text group-hover:text-accent transition-colors">API & Webhooks</h3>
                <p className="text-sm text-muted">Automate your workflows with our REST API and secure webhooks.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Support Channels & Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Contact Us</h2>
            <div className="rounded-xl border border-border bg-surface/20 overflow-hidden divide-y divide-border">
              <Link href="#" className="flex items-center justify-between p-4 transition-colors hover:bg-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 border border-border">
                    <Ticket className="h-4 w-4 text-text" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">Open a Ticket</p>
                    <p className="text-xs text-muted">Typically replies in 24h</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-text transition-colors" />
              </Link>
              <Link href="#" className="flex items-center justify-between p-4 transition-colors hover:bg-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 border border-border">
                    <MessageSquare className="h-4 w-4 text-text" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">Live Chat</p>
                    <p className="text-xs text-muted">Available for Pro users</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-text transition-colors" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">System Status</h2>
            <Link href="#" className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-sm font-medium text-emerald-500">All systems operational</p>
              </div>
              <Activity className="h-4 w-4 text-emerald-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity / Community */}
      <div className="rounded-xl border border-border bg-surface/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-64 w-64 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-xl font-bold text-text">Join the Grob Community</h2>
          <p className="text-sm text-muted max-w-xl">
            Connect with other developers, share your projects, and get help from the community in our official Discord server.
          </p>
        </div>
        <button className="shrink-0 rounded-xl bg-text px-6 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] relative z-10 flex items-center gap-2">
          Join Discord <ArrowRight className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
