"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  Upload,
  FileUp,
  X,
} from "lucide-react";
import { saveEnvVars } from "../settings/actions";
import { deployProject } from "../actions";

interface EnvRow {
  id: string;
  key: string;
  value: string;
  buildTime: boolean;
}

let _rowId = 0;
function rowId() {
  return `row-${Date.now()}-${++_rowId}`;
}

function newRow(key = "", value = "", buildTime = false): EnvRow {
  return { id: rowId(), key, value, buildTime };
}

function parseDotenv(text: string): { key: string; value: string }[] {
  const rows: { key: string; value: string }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) rows.push({ key, value });
  }
  return rows;
}

export function EnvVarsManager({
  projectId,
  initialVars,
}: {
  projectId: string;
  initialVars: {
    id: string;
    key: string;
    value: string;
    buildTime: boolean;
  }[];
}) {
  const router = useRouter();
  const [vars, setVars] = useState(initialVars);
  const [newVars, setNewVars] = useState<EnvRow[]>([]);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allVars = [...vars, ...newVars];
  const filtered = allVars.filter((v) =>
    v.key.toLowerCase().includes(query.toLowerCase()),
  );

  function applyParsed(text: string) {
    const parsed = parseDotenv(text);
    if (parsed.length === 0) {
      setImportError("No KEY=value pairs found.");
      return;
    }
    setNewVars((prev) => [
      ...prev,
      ...parsed.map((p) => newRow(p.key, p.value)),
    ]);
    setImportOpen(false);
    setImportText("");
    setImportError(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyParsed(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  }

  function addRow() {
    setNewVars((r) => [...r, newRow()]);
  }

  function removeVar(id: string) {
    if (newVars.find((v) => v.id === id)) {
      setNewVars((r) => r.filter((v) => v.id !== id));
    } else {
      setVars((r) => r.filter((v) => v.id !== id));
    }
  }

  function updateVar(id: string, field: "key" | "value", val: string) {
    const inNew = newVars.find((v) => v.id === id);
    if (inNew) {
      setNewVars((r) =>
        r.map((v) => (v.id === id ? { ...v, [field]: val } : v)),
      );
    } else {
      setVars((r) =>
        r.map((v) => (v.id === id ? { ...v, [field]: val } : v)),
      );
    }
  }

  function toggleBuildTime(id: string) {
    const inNew = newVars.find((v) => v.id === id);
    if (inNew) {
      setNewVars((r) =>
        r.map((v) => (v.id === id ? { ...v, buildTime: !v.buildTime } : v)),
      );
    } else {
      setVars((r) =>
        r.map((v) => (v.id === id ? { ...v, buildTime: !v.buildTime } : v)),
      );
    }
  }

  function handleSave() {
    startTransition(async () => {
      const formData = new FormData();
      [...vars, ...newVars]
        .filter((v) => v.key.trim())
        .forEach((v) => {
          formData.append("key[]", v.key);
          formData.append("value[]", v.value);
          formData.append("buildTime[]", v.buildTime ? "1" : "0");
        });
      const result = await saveEnvVars(projectId, formData);
      setNewVars([]);

      if (result.deploymentId) {
        const res = await fetch(
          `/api/deploy/trigger/${result.deploymentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deploy-latest" }),
          },
        );
        const data = await res.json();
        router.push(
          `/dashboard/projects/${projectId}/deployments/${data.deploymentId}`,
        );
      } else {
        await deployProject(projectId);
        router.push(`/dashboard/projects/${projectId}/deployments`);
      }
    });
  }

  const hasChanges =
    newVars.length > 0 ||
    vars.some((v) => {
      const orig = initialVars.find((o) => o.id === v.id);
      return (
        orig &&
        (orig.key !== v.key ||
          orig.value !== v.value ||
          orig.buildTime !== v.buildTime)
      );
    }) ||
    vars.length !== initialVars.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search variables..."
            className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm bg-bg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
        >
          <FileUp className="w-4 h-4" />
          Import .env
        </button>

        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>

        {hasChanges && (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setImportOpen(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">
                Import Environment Variables
              </h3>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted">
              Paste your <code className="text-accent">.env</code> file
              contents below, or upload a file. Existing variables with the
              same key will be{" "}
              <span className="text-text font-medium">overwritten</span> on
              save.
            </p>

            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportError(null);
              }}
              placeholder={"DATABASE_URL=postgres://...\nAPI_KEY=sk-...\n# comment ignored"}
              rows={10}
              className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-mono text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
            />

            {importError && (
              <p className="text-sm text-error">{importError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => applyParsed(importText)}
                disabled={!importText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload .env file
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".env,text/plain"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted mb-3">No environment variables</p>
          <p className="text-xs text-muted/70 mb-4">
            Add one manually or import a{" "}
            <code className="text-accent">.env</code> file.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
            >
              <FileUp className="w-4 h-4" />
              Import .env
            </button>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-muted border-b border-border">
                  <th className="px-4 py-2.5 font-medium">Key</th>
                  <th className="px-4 py-2.5 font-medium">Value</th>
                  <th className="px-4 py-2.5 font-medium">Build Time</th>
                  <th className="px-4 py-2.5 font-medium w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-t border-border hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-2">
                      <input
                        value={v.key}
                        onChange={(e) => updateVar(v.id, "key", e.target.value)}
                        placeholder="KEY"
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={v.value}
                        onChange={(e) =>
                          updateVar(v.id, "value", e.target.value)
                        }
                        placeholder="value"
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => toggleBuildTime(v.id)}
                        className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
                          v.buildTime
                            ? "border-accent/30 bg-accent/10 text-accent"
                            : "border-border text-muted hover:bg-white/[0.04]"
                        }`}
                      >
                        {v.buildTime ? "Build" : "Runtime"}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeVar(v.id)}
                        title="Remove"
                        className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
