"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createTicket } from "../../actions";
import {
  ArrowLeft,
  Send,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "billing", label: "Billing & Plans" },
  { value: "project", label: "Project Issue" },
  { value: "domain", label: "Domain & DNS" },
  { value: "security", label: "Security" },
  { value: "integration", label: "Integration" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      const fd = new FormData(form);
      await createTicket(fd);
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support/tickets"
          className="p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <h1 className="text-2xl font-semibold text-text">Open a Support Ticket</h1>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          Our support team typically responds within 4 hours during business days.
          For urgent issues, please set priority to &quot;Urgent&quot;.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Subject</label>
          <input
            name="subject"
            required
            placeholder="Brief description of your issue"
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Category</label>
            <select
              name="category"
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Priority</label>
            <select
              name="priority"
              defaultValue="normal"
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Message</label>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, or relevant project names."
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Link
            href="/dashboard/support/tickets"
            className="px-4 py-2.5 text-sm font-medium text-muted hover:text-text transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-accent text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isPending ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
