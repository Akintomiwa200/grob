import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings2, Palette, CreditCard, KeyRound, Monitor, Moon, Sun, Plus, Copy } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl pb-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted text-sm">Manage your global preferences, billing, and API tokens.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Navigation Sidebar */}
        <aside className="md:w-64 shrink-0">
          <nav className="flex flex-col gap-1 sticky top-8">
            <a href="#general" className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-text transition-colors">
              <Settings2 className="h-4 w-4" /> General
            </a>
            <a href="#appearance" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-text">
              <Palette className="h-4 w-4" /> Appearance
            </a>
            <a href="#billing" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-text">
              <CreditCard className="h-4 w-4" /> Billing
            </a>
            <a href="#tokens" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-text">
              <KeyRound className="h-4 w-4" /> API Tokens
            </a>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-12">
          
          {/* Appearance Section */}
          <section id="appearance" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-text">Appearance</h2>
              <p className="text-sm text-muted">Customize how Grob looks on your device.</p>
            </div>
            
            <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* System Theme */}
                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-border bg-surface/50 transition-all hover:border-accent/50 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12151D] border border-border group-hover:bg-accent/10 transition-colors">
                      <Monitor className="h-5 w-5 text-text group-hover:text-accent transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-text">System</span>
                  </button>
                  
                  {/* Light Theme */}
                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-border bg-surface/50 transition-all hover:border-accent/50 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200 group-hover:bg-accent/10 transition-colors">
                      <Sun className="h-5 w-5 text-gray-900 group-hover:text-accent transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-text">Light</span>
                  </button>
                  
                  {/* Dark Theme (Active) */}
                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-accent bg-accent/5 transition-all group relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-bg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B0E14] border border-border shadow-[0_0_15px_rgba(110,91,255,0.2)]">
                      <Moon className="h-5 w-5 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-text">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Billing Section */}
          <section id="billing" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-text">Billing & Plan</h2>
              <p className="text-sm text-muted">You are currently on the free Hobby plan.</p>
            </div>
            
            <div className="rounded-xl border border-border bg-surface/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-sm">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-text">Hobby</h3>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-text border border-border">Free</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Perfect for personal projects and small experiments. Upgrade to Pro for unlimited team members and advanced analytics.
                  </p>
                </div>
                <button className="shrink-0 rounded-xl bg-gradient-to-r from-[#6E5BFF] to-[#8F7CFF] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(110,91,255,0.3)]">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </section>

          {/* API Tokens */}
          <section id="tokens" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text">Personal Access Tokens</h2>
                <p className="text-sm text-muted">Tokens you have generated to access the Grob API.</p>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-text px-4 py-2 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="h-4 w-4" /> Generate New
              </button>
            </div>
            
            <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
              <div className="p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-border mb-4">
                  <KeyRound className="h-5 w-5 text-muted" />
                </div>
                <h3 className="text-sm font-medium text-text">No tokens generated</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Generate a personal access token to authenticate with the Grob API or CLI from your terminal.
                </p>
              </div>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
