"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { replyToTicket } from "../../actions";
import { Send } from "lucide-react";

export default function ReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const body = new FormData(form).get("body") as string;
        if (!body.trim()) return;
        startTransition(async () => {
          await replyToTicket(ticketId, body);
          form.reset();
          router.refresh();
        });
      }}
      className="bg-surface border border-border rounded-xl p-4 space-y-3"
    >
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Type your reply..."
        className="w-full bg-transparent text-text placeholder-muted focus:outline-none resize-none text-sm"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {isPending ? "Sending..." : "Reply"}
        </button>
      </div>
    </form>
  );
}
