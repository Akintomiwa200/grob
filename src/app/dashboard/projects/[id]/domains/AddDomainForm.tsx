"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { addDomain } from "./actions";

export function AddDomainForm({ projectId }: { projectId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await addDomain(projectId, formData);
      formRef.current?.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex gap-2"
    >
      <input
        name="name"
        placeholder="example.com"
        required
        className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
      >
        <Plus className="w-4 h-4" />
        {pending ? "Adding..." : "Add Domain"}
      </button>
    </form>
  );
}
