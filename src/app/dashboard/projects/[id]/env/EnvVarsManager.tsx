"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { saveEnvVars } from "../settings/actions";

interface EnvVar {
  id: string;
  key: string;
  value: string;
  buildTime: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Row {
  key: string;
  value: string;
  buildTime: boolean;
}

function toRows(initial: EnvVar[]): Row[] {
  return initial.map((v) => ({ key: v.key, value: v.value, buildTime: v.buildTime }));
}

export function EnvVarsManager({
  projectId,
  initialVars,
}: {
  projectId: string;
  initialVars: EnvVar[];
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initialVars));
  const [saved, setSaved] = useState(toRows(initialVars));
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [sortKey, setSortKey] = useState<"key-asc" | "key-desc" | "newest" | "oldest">("key-asc");
  const [showSort, setShowSort] = useState(false);

  const hasChanges = JSON.stringify(rows) !== JSON.stringify(saved);

  function addRow() {
    setRows((r) => [...r, { key: "", value: "", buildTime: false }]);
    setStatus("idle");
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
    setStatus("idle");
  }

  function updateRow(i: number, field: keyof Row, val: string | boolean) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
    setStatus("idle");
  }

  function toggleReveal(i: number) {
    setRevealed((r) => ({ ...r, [i]: !r[i] }));
  }

  async function handleSave() {
    setStatus("idle");
    const formData = new FormData();
    const validRows = rows.filter((r) => r.key.trim());
    for (const row of validRows) {
      formData.append("key[]", row.key);
      formData.append("value[]", row.value);
      formData.append("buildTime[]", row.buildTime ? "1" : "0");
    }

    try {
      const result = await saveEnvVars(projectId, formData);
      setSaved(rows.map((r) => ({ ...r, key: r.key.trim() })).filter((r) => r.key));
      setStatus("saved");

      if (result.deploymentId) {
        fetch(`/api/deploy/trigger/${result.deploymentId}?type=deploy-latest`).catch(() => {});
      } else {
        fetch(`/api/deploy/${projectId}`, { method: "POST" }).catch(() => {});
      }

      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  function handleSaveClick() {
    startTransition(handleSave);
  }

  const sorted = [...rows].sort((a, b) => {
    switch (sortKey) {
      case "key-asc":
        return a.key.localeCompare(b.key);
      case "key-desc":
        return b.key.localeCompare(a.key);
      case "newest":
        return 0;
      case "oldest":
        return 0;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSort((s) => !s)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
          >
            {sortKey === "key-asc" || sortKey === "newest" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
            Sort
          </button>
          {showSort && (
            <div className="absolute z-10 top-full left-0 mt-1 w-44 rounded-lg border border-border bg-surface shadow-lg">
              {(["key-asc", "key-desc", "newest", "oldest"] as const).map((sk) => (
                <button
                  key={sk}
                  onClick={() => {
                    setSortKey(sk);
                    setShowSort(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    sortKey === sk
                      ? "text-accent bg-accent/10"
                      : "text-text hover:bg-white/[0.04]"
                  }`}
                >
                  {{ "key-asc": "Name (A–Z)", "key-desc": "Name (Z–A)", newest: "Newest first", oldest: "Oldest first" }[sk]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {status === "saved" && (
            <span className="text-xs text-emerald-500 font-medium">Saved</span>
          )}
          {status === "error" && (
            <span className="text-xs text-red-500 font-medium">Error saving</span>
          )}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!hasChanges || pending}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">No environment variables yet</p>
          <button
            onClick={addRow}
            className="mt-3 text-sm text-accent hover:underline"
          >
            Add your first variable
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                <th className="text-left px-4 py-2.5 font-medium text-muted">Key</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted">Value</th>
                <th className="text-center px-4 py-2.5 font-medium text-muted w-24">Build</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const origIdx = rows.indexOf(row);
                return (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => updateRow(origIdx, "key", e.target.value)}
                        placeholder="KEY"
                        className="w-full bg-transparent font-mono text-text placeholder:text-muted/40 focus:outline-none text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type={revealed[origIdx] ? "text" : "password"}
                          value={row.value}
                          onChange={(e) => updateRow(origIdx, "value", e.target.value)}
                          placeholder="value"
                          className="flex-1 bg-transparent font-mono text-text placeholder:text-muted/40 focus:outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleReveal(origIdx)}
                          className="text-muted hover:text-text transition-colors"
                        >
                          {revealed[origIdx] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.buildTime}
                        onChange={(e) => updateRow(origIdx, "buildTime", e.target.checked)}
                        className="accent-accent"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(origIdx)}
                        className="text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
