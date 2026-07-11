import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tickets | Support | Grob" };

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  closed: "bg-muted/10 text-muted",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  open: CheckCircle2,
  pending: Clock,
  closed: XCircle,
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export default async function TicketListPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { status } = await props.searchParams;
  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "all") where.status = status;

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  const counts = await prisma.supportTicket.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Support Tickets</h1>
          <p className="text-sm text-muted mt-1">
            {countMap.open ?? 0} open · {countMap.pending ?? 0} pending ·{" "}
            {countMap.closed ?? 0} closed
          </p>
        </div>
        <Link
          href="/dashboard/support/tickets/new"
          className="flex items-center gap-2 bg-accent text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "open", "pending", "closed"].map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/dashboard/support/tickets" : `/dashboard/support/tickets?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (status || "all") === s
                ? "bg-accent/10 text-accent"
                : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="text-center py-16 text-muted space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto opacity-40" />
          <p>No tickets found</p>
          <Link
            href="/dashboard/support/tickets/new"
            className="text-accent hover:underline text-sm"
          >
            Create your first ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const StatusIcon = STATUS_ICON[ticket.status] || CheckCircle2;
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/support/tickets/${ticket.id}`}
                className="block bg-surface border border-border rounded-xl px-5 py-4 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          STATUS_STYLES[ticket.status] || ""
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {ticket.status}
                      </span>
                      <span className="text-xs text-muted">
                        {PRIORITY_LABEL[ticket.priority] || "Normal"}
                      </span>
                    </div>
                    <div className="font-medium text-text truncate">
                      {ticket.subject}
                    </div>
                    {ticket.messages[0] && (
                      <div className="text-sm text-muted truncate mt-1">
                        {ticket.messages[0].body}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted shrink-0 text-right">
                    <div>{new Date(ticket.updatedAt).toLocaleDateString()}</div>
                    <div className="mt-0.5">
                      {ticket.messages.length} message{ticket.messages.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
