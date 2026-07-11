import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Search,
  LifeBuoy,
  MessageSquare,
  BookOpen,
  CircleDollarSign,
  AppWindow,
  Lock,
  Plug,
  ChevronRight,
  Clock,
  BarChart3,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support | Grob" };

const KB_CATEGORIES = [
  { name: "Getting Started", slug: "getting-started", icon: BookOpen, articles: 6 },
  { name: "Billing & Plans", slug: "billing", icon: CircleDollarSign, articles: 4 },
  { name: "Projects & Deployments", slug: "projects", icon: AppWindow, articles: 5 },
  { name: "Security & Access", slug: "security", icon: Lock, articles: 3 },
  { name: "Integrations", slug: "integrations", icon: Plug, articles: 4 },
  { name: "Webhooks & API", slug: "api", icon: LifeBuoy, articles: 4 },
];

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const recentTickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  const openCount = await prisma.supportTicket.count({
    where: { userId: session.user.id, status: "open" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10 px-4 py-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <LifeBuoy className="w-7 h-7 text-accent" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-text">Help &amp; Support</h1>
        <p className="text-muted max-w-md mx-auto">
          Find answers, browse documentation, or contact our support team.
        </p>
      </div>

      {/* Search */}
      <form action="/dashboard/support/kb" method="GET">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            name="q"
            placeholder="Search the knowledge base..."
            className="w-full bg-surface border border-border rounded-xl py-3.5 pl-12 pr-4 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />
        </div>
      </form>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/support/tickets/new"
          className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-medium text-text group-hover:text-accent transition-colors">
                Open a Ticket
              </div>
              <div className="text-sm text-muted">Get help from our team</div>
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard/support/chat"
          className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="font-medium text-text group-hover:text-accent transition-colors">
                Live Chat
              </div>
              <div className="text-sm text-muted">Chat with an agent</div>
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard/support/status"
          className="bg-surface border border-border rounded-xl p-5 hover:border-accent/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="font-medium text-text group-hover:text-accent transition-colors">
                System Status
              </div>
              <div className="text-sm text-muted">All systems operational</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent tickets */}
      {recentTickets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">
              Your Tickets
              {openCount > 0 && (
                <span className="ml-2 text-sm font-normal text-muted">
                  ({openCount} open)
                </span>
              )}
            </h2>
            <Link
              href="/dashboard/support/tickets"
              className="text-sm text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentTickets.map((t) => (
              <Link
                key={t.id}
                href={`/dashboard/support/tickets/${t.id}`}
                className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.status === "open"
                        ? "bg-green-500"
                        : t.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-muted"
                    }`}
                  />
                  <span className="text-sm text-text truncate">{t.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted shrink-0 ml-3">
                  <Clock className="w-3 h-3" />
                  {new Date(t.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Base categories */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Knowledge Base</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {KB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/dashboard/support/kb/${cat.slug}`}
                className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:border-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                  <div>
                    <div className="font-medium text-text">{cat.name}</div>
                    <div className="text-xs text-muted">{cat.articles} articles</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
