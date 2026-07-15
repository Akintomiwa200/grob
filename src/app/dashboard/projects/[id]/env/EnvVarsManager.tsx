"use client";

import { useState, useTransition, useCallback } from "react";
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, Eye, EyeOff, ClipboardPaste, X, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [status, setStatus] = useState<"idle" | "saved" | "error" | "saving" | "rebuilding" | "rebuild-triggered">("idle");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [sortKey, setSortKey] = useState<"key-asc" | "key-desc" | "newest" | "oldest">("key-asc");
  const [showSort, setShowSort] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [parsedVars, setParsedVars] = useState<{ key: string; value: string; buildTime: boolean }[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

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
      setStatus("saving");
      const result = await saveEnvVars(projectId, formData);
      setSaved(rows.map((r) => ({ ...r, key: r.key.trim() })).filter((r) => r.key));
      setStatus("saved");

      // Trigger rebuild with updated env vars
      if (result.deploymentId) {
        setStatus("rebuilding");
        fetch(`/api/deploy/trigger/${result.deploymentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deploy-latest" }),
        }).then(() => {
          setStatus("rebuild-triggered");
          setTimeout(() => setStatus("idle"), 3000);
        }).catch(() => {
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        });
      } else {
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch {
      setStatus("error");
    }
  }

  function handleSaveClick() {
    startTransition(handleSave);
  }

  function parseEnvContent(content: string) {
    setParseError(null);
    const lines = content.split("\n");
    const parsed: { key: string; value: string; buildTime: boolean }[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith("#")) continue;
      
      // Match KEY=VALUE pattern
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) {
        setParseError(`Line ${i + 1}: Invalid format "${line.substring(0, 30)}${line.length > 30 ? "..." : ""}"`);
        return;
      }
      
      const key = match[1];
      let value = match[2].trim();
      
      // Handle quoted values
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Handle multi-line values (basic: just remove surrounding quotes)
      if (value.includes("\\n")) {
        value = value.replace(/\\n/g, "\n");
      }
      
      parsed.push({ key, value, buildTime: true });
    }
    
    setParsedVars(parsed);
  }

  function handlePasteConfirm() {
    // Merge parsed vars with existing rows
    const existingKeys = new Set(rows.map(r => r.key));
    const newRows = [...rows];
    
    for (const parsed of parsedVars) {
      const existingIdx = newRows.findIndex(r => r.key === parsed.key);
      if (existingIdx >= 0) {
        // Update existing
        newRows[existingIdx] = { ...newRows[existingIdx], value: parsed.value };
      } else {
        // Add new
        newRows.push(parsed);
      }
    }
    
    setRows(newRows);
    setShowPaste(false);
    setPasteContent("");
    setParsedVars([]);
    setParseError(null);
    setStatus("idle");
  }

  function handlePasteCancel() {
    setShowPaste(false);
    setPasteContent("");
    setParsedVars([]);
    setParseError(null);
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
        
        <button
          type="button"
          onClick={() => setShowPaste(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-border rounded-lg text-text hover:bg-white/[0.04] transition-colors"
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste .env
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

        <div className="ml-auto flex items-center gap-3">
          {status === "saving" && (
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {status === "saved" && (
            <span className="text-xs text-emerald-500 font-medium">Saved</span>
          )}
          {status === "rebuilding" && (
            <span className="text-xs text-signal font-medium flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Rebuilding...
            </span>
          )}
          {status === "rebuild-triggered" && (
            <span className="text-xs text-success font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Rebuild triggered
            </span>
          )}
          {status === "error" && (
            <span className="text-xs text-error font-medium">Error saving</span>
          )}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!hasChanges || pending || status === "saving" || status === "rebuilding"}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending || status === "saving" || status === "rebuilding" ? (
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

      {/* Paste .env Modal */}
      {showPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-2xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-text">Paste .env Content</h3>
                <p className="text-xs text-muted mt-0.5">Paste your .env file content below</p>
              </div>
              <button
                onClick={handlePasteCancel}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/[0.06] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5">
              <textarea
                value={pasteContent}
                onChange={(e) => {
                  setPasteContent(e.target.value);
                  parseEnvContent(e.target.value);
                }}
                placeholder={`# Database\nDATABASE_URL=postgresql://user:pass@host:5432/db\nREDIS_URL=redis://localhost:6379\n\n# API Keys\nAPI_KEY=sk-1234567890\nSECRET_KEY=my-secret-key\n\n# Feature Flags\nENABLE_FEATURE_X=true`}
                className="w-full h-64 px-4 py-3 border border-border rounded-lg text-sm font-mono text-text placeholder-muted/50 bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors resize-none"
                spellCheck={false}
              />
              
              {parseError && (
                <div className="flex items-center gap-2 mt-3 text-xs text-error">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {parseError}
                </div>
              )}
              
              {parsedVars.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted font-medium mb-2">
                    {parsedVars.length} variable{parsedVars.length !== 1 ? "s" : ""} found:
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {parsedVars.map((v, i) => {
                      const exists = rows.some(r => r.key === v.key);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-mono"
                        >
                          {exists ? (
                            <span className="text-yellow-500">Update</span>
                          ) : (
                            <span className="text-success">New</span>
                          )}
                          <span className="text-text font-semibold">{v.key}</span>
                          <span className="text-muted">=</span>
                          <span className="text-muted truncate max-w-[200px]">
                            {v.value.substring(0, 30)}{v.value.length > 30 ? "..." : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
              <button
                onClick={handlePasteCancel}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteConfirm}
                disabled={parsedVars.length === 0 || !!parseError}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Import {parsedVars.length} Variable{parsedVars.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
