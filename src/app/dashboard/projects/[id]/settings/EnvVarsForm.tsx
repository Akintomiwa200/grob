"use client";

import { useState } from "react";

export function EnvVarsForm({ projectId, initialVars, saveAction }: { 
  projectId: string, 
  initialVars: { id: string, key: string, value: string }[],
  saveAction: (formData: FormData) => void 
}) {
  const [vars, setVars] = useState(initialVars);

  return (
    <form action={saveAction} className="space-y-3">
      <div id="envVars">
        {vars.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-border rounded-xl text-center text-sm text-muted">
            No environment variables yet
          </div>
        ) : null}
        {vars.map((env, index) => (
          <div key={env.id || index} className="flex gap-2 mb-2">
            <input
              name="key[]"
              defaultValue={env.key}
              placeholder="KEY"
              className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
            <input
              name="value[]"
              defaultValue={env.value}
              placeholder="value"
              className="flex-[2] px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setVars(vars.filter((_, i) => i !== index))}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-white/[0.05]"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setVars([...vars, { id: Math.random().toString(), key: "", value: "" }])}
          className="px-3 py-2 text-sm border rounded-lg hover:bg-white/[0.05]"
        >
          + Add Variable
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 shadow-sm"
        >
          Save Variables
        </button>
      </div>
    </form>
  );
}
