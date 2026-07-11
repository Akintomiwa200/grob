import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, XCircle, MessageSquare } from "lucide-react";
import ReplyForm from "./ReplyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ticket | Support | Grob" };

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  closed: "bg-muted/10 text-muted",
};

export default async function TicketDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, image: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const isClosed = ticket.status === "closed";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support/tickets"
          className="p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-text truncate">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${STATUS_STYLES[ticket.status] || ""}`}>
              {ticket.status}
            </span>
            <span>·</span>
            <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span className="capitalize">{ticket.category}</span>
          </div>
        </div>
        {!isClosed && (
          <form>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <button
              formAction={async () => {
                "use server";
                const { closeTicket } = await import("../../actions");
                await closeTicket(ticket.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-red-500 hover:border-red-500/30 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Close
            </button>
          </form>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {ticket.messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl px-5 py-4 ${
              msg.isAdmin
                ? "bg-accent/5 border border-accent/20"
                : "bg-surface border border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent">
                {msg.author?.name?.[0] || "?"}
              </div>
              <span className="text-sm font-medium text-text">
                {msg.isAdmin ? "Support Team" : msg.author?.name || "You"}
              </span>
              <span className="text-xs text-muted">
                {new Date(msg.createdAt).toLocaleDateString()}{" "}
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
              {msg.body}
            </p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {!isClosed ? (
        <ReplyForm ticketId={ticket.id} />
      ) : (
        <div className="text-center py-6 text-muted text-sm border border-border rounded-xl bg-surface">
          This ticket is closed.
          <Link
            href="/dashboard/support/tickets/new"
            className="block mt-2 text-accent hover:underline"
          >
            Open a new ticket
          </Link>
        </div>
      )}
    </div>
  );
}
