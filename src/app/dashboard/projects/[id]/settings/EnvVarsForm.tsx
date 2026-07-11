"use client";

import { useState } from "react";

export function EnvVarsForm({
  projectId,
  initialVars,
  saveAction,
}: {
  projectId: string;
  initialVars: { id: string; key: string; value: string; buildTime: boolean }[];
  saveAction: (formData: FormData) => void;
}) {
  const [vars, setVars] = useState(
    initialVars.map((v) => ({ ...v, buildTime: v.buildTime ?? true }))
  );

  return (
    <form action={saveAction} className="space-y-3">
      <div id="envVars">
        {vars.length === 0 && (
          <div className="p-4 border-2 border-dashed border-border rounded-xl text-center text-sm text-muted">
            No environment variables yet
          </div>
        )}
        {vars.map((env, index) => (
          <div key={env.id || index} className="flex gap-2 mb-2 items-end">
            <div className="flex-1">
              <input
                name="key[]"
                defaultValue={env.key}
                placeholder="KEY"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div className="flex-[2]">
              <input
                name="value[]"
                defaultValue={env.value}
                placeholder="value"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <label className="flex items-center gap-1.5 px-2 py-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                name="buildTime[]"
                value={String(index)}
                defaultChecked={env.buildTime}
                className="accent-accent"
              />
              <span className="text-muted whitespace-nowrap">Build</span>
            </label>
            <button
              type="button"
              onClick={() => setVars(vars.filter((_, i) => i !== index))}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() =>
            setVars([
              ...vars,
              {
                id: Math.random().toString(),
                key: "",
                value: "",
                buildTime: true,
              },
            ])
          }
          className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          + Add Variable
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 shadow-sm transition"
        >
          Save Variables
        </button>
      </div>
    </form>
  );
}
