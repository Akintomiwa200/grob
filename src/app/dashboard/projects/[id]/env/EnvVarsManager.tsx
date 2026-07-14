"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { EnvVarForm } from "./Envvarform";
import { EnvVarsList } from "./Envvarslist";
import type { EnvVar } from "./Types";

export function EnvVarsManager({
  projectId,
  initialVars,
}: {
  projectId: string;
  initialVars: EnvVar[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(initialVars.length === 0);

  function handleSaved() {
    setFormOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={() => setFormOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
        >
          {formOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add New
        </button>
        {formOpen && (
          <div className="mt-3">
            <EnvVarForm projectId={projectId} onSaved={handleSaved} />
          </div>
        )}
      </div>

      <EnvVarsList projectId={projectId} vars={initialVars} />
    </div>
  );
}
