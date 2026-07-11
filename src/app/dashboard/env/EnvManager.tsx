"use client";

import { useState, useTransition } from "react";
import { addEnvVar, deleteEnvVar, toggleBuildTime } from "./actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Plus, Check } from "lucide-react";

interface EnvEntry {
  id: string;
  key: string;
  value: string;
  buildTime: boolean;
}

export function EnvManager({
  projectId,
  projectName,
  initialVars,
}: {
  projectId: string;
  projectName: string;
  initialVars: EnvEntry[];
}) {
  const [vars, setVars] = useState(initialVars);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newBuildTime, setNewBuildTime] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleShow(id: string) {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAdd() {
    if (!newKey.trim()) return;
    startTransition(async () => {
      await addEnvVar(projectId, newKey.trim(), newValue, newBuildTime);
      setVars((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, key: newKey.trim(), value: newValue, buildTime: newBuildTime },
      ]);
      setNewKey("");
      setNewValue("");
      setNewBuildTime(true);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEnvVar(id);
      setVars((prev) => prev.filter((v) => v.id !== id));
      router.refresh();
    });
  }

  function handleToggleBuildTime(id: string) {
    startTransition(async () => {
      await toggleBuildTime(id);
      setVars((prev) =>
        prev.map((v) => (v.id === id ? { ...v, buildTime: !v.buildTime } : v))
      );
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-surface/30">
        <span className="font-semibold text-text text-sm">{projectName}</span>
        <span className="text-muted text-xs ml-2">{vars.length} variables</span>
      </div>

      {vars.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-5 py-2.5 font-medium">Key</th>
              <th className="px-5 py-2.5 font-medium">Value</th>
              <th className="px-5 py-2.5 font-medium hidden sm:table-cell">Build</th>
              <th className="px-5 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vars.map((env) => (
              <tr key={env.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-2.5">
                  <span className="font-mono text-sm text-text">{env.key}</span>
                </td>
                <td className="px-5 py-2.5">
                  {editing === env.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          startTransition(async () => {
                            await addEnvVar(projectId, env.key, editValue, env.buildTime);
                            setVars((prev) =>
                              prev.map((v) =>
                                v.id === env.id ? { ...v, value: editValue } : v
                              )
                            );
                            setEditing(null);
                            router.refresh();
                          });
                        }
                        if (e.key === "Escape") setEditing(null);
                      }}
                      onBlur={() => setEditing(null)}
                      className="font-mono text-sm text-text bg-transparent border-b border-accent focus:outline-none w-full"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        toggleShow(env.id);
                        setEditing(env.id);
                        setEditValue(env.value);
                      }}
                      className="font-mono text-sm text-muted flex items-center gap-2 hover:text-text transition-colors"
                    >
                      {showValues[env.id] ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          {env.value}
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          {env.value.slice(0, 3)}••••••••
                        </>
                      )}
                    </button>
                  )}
                </td>
                <td className="px-5 py-2.5 hidden sm:table-cell">
                  <button
                    onClick={() => handleToggleBuildTime(env.id)}
                    className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                      env.buildTime
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted/10 text-muted"
                    }`}
                  >
                    {env.buildTime ? "Included" : "Excluded"}
                  </button>
                </td>
                <td className="px-5 py-2.5 text-right">
                  <button
                    onClick={() => handleDelete(env.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {vars.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-muted">
          No environment variables
        </div>
      )}

      {/* Add new row */}
      <div className="px-5 py-3 border-t border-border bg-surface/10">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Key</label>
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="API_KEY"
              className="w-full px-3 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-transparent focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
          <div className="flex-[2]">
            <label className="text-xs text-muted mb-1 block">Value</label>
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-1.5 border border-border rounded-lg text-sm font-mono text-text bg-transparent focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
          <button
            onClick={() => setNewBuildTime(!newBuildTime)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              newBuildTime
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-border text-muted"
            }`}
            title={newBuildTime ? "Available at build time" : "Runtime only"}
          >
            {newBuildTime ? "Build" : "Runtime"}
          </button>
          <button
            onClick={handleAdd}
            disabled={isPending || !newKey.trim()}
            className="p-1.5 rounded-lg bg-accent text-white hover:opacity-90 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
