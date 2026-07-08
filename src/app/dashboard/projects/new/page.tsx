"use client";

import { useState } from "react";
import { createProject } from "./actions";
import { GitHubRepos } from "./GitHubRepos";

const frameworks = [
  { value: "nextjs", label: "Next.js", build: "npm run build", out: ".next", install: "npm install" },
  { value: "react", label: "React (Vite)", build: "npm run build", out: "dist", install: "npm install" },
  { value: "vue", label: "Vue", build: "npm run build", out: "dist", install: "npm install" },
  { value: "svelte", label: "Svelte", build: "npm run build", out: "build", install: "npm install" },
  { value: "static", label: "Static HTML", build: "", out: ".", install: "" },
];

export default function NewProjectPage() {
  const [selectedRepo, setSelectedRepo] = useState<{
    fullName: string;
    name: string;
    cloneUrl: string;
    defaultBranch: string;
  } | null>(null);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">New Project</h1>
      <p className="text-muted text-sm mb-8">
        Import a Git repository and deploy it to production.
      </p>

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Import from GitHub</h2>
        <GitHubRepos
          onSelect={(repo) => {
            setSelectedRepo({
              fullName: repo.fullName,
              name: repo.name,
              cloneUrl: repo.cloneUrl,
              defaultBranch: repo.defaultBranch,
            });
            const nameInput = document.getElementById("name") as HTMLInputElement;
            if (nameInput && !nameInput.value) nameInput.value = repo.name;
            const gitUrlInput = document.getElementById("gitUrl") as HTMLInputElement;
            if (gitUrlInput) gitUrlInput.value = repo.cloneUrl;
          }}
        />
      </div>

      <form action={createProject} className="space-y-6">
        <input type="hidden" name="repoFullName" value={selectedRepo?.fullName || ""} />
        <input type="hidden" name="defaultBranch" value={selectedRepo?.defaultBranch || "main"} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">Project Name</label>
          <input
            id="name"
            name="name"
            required
            placeholder="my-awesome-app"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5">Description (optional)</label>
          <input
            id="description"
            name="description"
            placeholder="A short description of your project"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
          />
        </div>

        <div>
          <label htmlFor="gitUrl" className="block text-sm font-medium mb-1.5">Git Repository URL</label>
          <input
            id="gitUrl"
            name="gitUrl"
            placeholder="https://github.com/username/repo"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
          />
        </div>

        <div>
          <label htmlFor="framework" className="block text-sm font-medium mb-1.5">Framework Preset</label>
          <select
            id="framework"
            name="framework"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            onChange={(e) => {
              const fw = frameworks.find((f) => f.value === e.target.value);
              if (fw) {
                const bc = document.getElementById("buildCommand") as HTMLInputElement;
                const od = document.getElementById("outputDir") as HTMLInputElement;
                const ic = document.getElementById("installCommand") as HTMLInputElement;
                if (bc) bc.value = fw.build;
                if (od) od.value = fw.out;
                if (ic) ic.value = fw.install;
              }
            }}
          >
            <option value="">Custom</option>
            {frameworks.map((fw) => (
              <option key={fw.value} value={fw.value}>{fw.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="buildCommand" className="block text-sm font-medium mb-1.5">Build Command</label>
            <input
              id="buildCommand"
              name="buildCommand"
              defaultValue="npm run build"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
          </div>
          <div>
            <label htmlFor="outputDir" className="block text-sm font-medium mb-1.5">Output Directory</label>
            <input
              id="outputDir"
              name="outputDir"
              defaultValue=".next"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="installCommand" className="block text-sm font-medium mb-1.5">Install Command</label>
          <input
            id="installCommand"
            name="installCommand"
            defaultValue="npm install"
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
          />
        </div>

        {selectedRepo && (
          <label className="flex items-center gap-3 p-3 border rounded-xl bg-surface">
            <input
              type="checkbox"
              name="createWebhook"
              defaultChecked
              className="w-4 h-4 rounded border-gray-300"
            />
            <div className="text-sm">
              <span className="font-medium">Auto-create webhook</span>
              <p className="text-xs text-muted">Automatically deploy on every push to {selectedRepo.fullName}</p>
            </div>
          </label>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
          >
            Create Project
          </button>
          <a
            href="/dashboard"
            className="text-sm text-muted hover:text-text"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
