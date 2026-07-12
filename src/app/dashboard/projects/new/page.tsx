"use client";

import { useState, useCallback } from "react";
import { createProject } from "./actions";
import { GitHubRepos } from "./GitHubRepos";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const pmCommands: Record<PackageManager, { install: string; run: string }> = {
  npm:  { install: "npm install",            run: "npm run" },
  pnpm: { install: "pnpm install",           run: "pnpm" },
  yarn: { install: "yarn install",           run: "yarn" },
  bun:  { install: "bun install",            run: "bun run" },
};

const frameworks = [
  { value: "nextjs",  label: "Next.js",          out: ".next",            needsBuild: true },
  { value: "react",   label: "React (Vite)",     out: "dist",             needsBuild: true },
  { value: "vue",     label: "Vue",              out: "dist",             needsBuild: true },
  { value: "svelte",  label: "Svelte",           out: "build",            needsBuild: true },
  { value: "node",    label: "Node.js (Generic)", out: "dist",            needsBuild: false },
  { value: "rust",    label: "Rust (Cargo)",     out: "target/release",   needsBuild: false, install: "cargo fetch", build: "cargo build --release" },
  { value: "go",      label: "Go",               out: ".",                needsBuild: false, install: "go mod download", build: "go build -o main ." },
  { value: "python",  label: "Python",           out: ".",                needsBuild: false, install: "pip install -r requirements.txt", build: "python -m compileall ." },
  { value: "static",  label: "Static HTML",      out: ".",                needsBuild: false, install: "", build: "" },
];

function getFrameworkCommands(fw: typeof frameworks[number], pm: PackageManager) {
  if (fw.install !== undefined && fw.build !== undefined) {
    return { install: fw.install, build: fw.build };
  }
  const pmCmd = pmCommands[pm];
  return {
    install: pmCmd.install,
    build: fw.needsBuild ? `${pmCmd.run} build` : "",
  };
}

export default function NewProjectPage() {
  const [selectedRepo, setSelectedRepo] = useState<{
    fullName: string;
    name: string;
    cloneUrl: string;
    defaultBranch: string;
  } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");

  const applyFramework = useCallback((fwValue: string, pm: PackageManager) => {
    const fw = frameworks.find((f) => f.value === fwValue);
    if (!fw) return;
    const cmds = getFrameworkCommands(fw, pm);
    const bc = document.getElementById("buildCommand") as HTMLInputElement;
    const od = document.getElementById("outputDir") as HTMLInputElement;
    const ic = document.getElementById("installCommand") as HTMLInputElement;
    if (bc) bc.value = cmds.build;
    if (od) od.value = fw.out;
    if (ic) ic.value = cmds.install;
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-6 text-text">
      <h1 className="text-3xl font-bold mb-2">New Project</h1>
      <p className="text-muted text-base mb-10">
        Import a Git repository and deploy it to production.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Left Column: Import Git */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Import from GitHub</h2>
          <GitHubRepos
            onSelect={async (repo) => {
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

              // Auto-detect framework and package manager
              setIsDetecting(true);
              try {
                const res = await fetch(`/api/github/detect-framework?repo=${encodeURIComponent(repo.fullName)}`);
                if (res.ok) {
                  const data = await res.json();

                  // Detect package manager from lockfiles
                  if (data.packageManager) {
                    setPackageManager(data.packageManager);
                  }

                  const fwSelect = document.getElementById("framework") as HTMLSelectElement;
                  if (fwSelect) {
                    fwSelect.value = data.framework || "";
                    const pm = data.packageManager || packageManager;
                    applyFramework(data.framework || "", pm);
                  }

                  // If server returned specific commands, use them
                  const bc = document.getElementById("buildCommand") as HTMLInputElement;
                  const od = document.getElementById("outputDir") as HTMLInputElement;
                  const ic = document.getElementById("installCommand") as HTMLInputElement;
                  if (data.build && bc) bc.value = data.build;
                  if (data.out && od) od.value = data.out;
                  if (data.install && ic) ic.value = data.install;
                }
              } catch (e) {
                console.error("Failed to detect framework:", e);
              } finally {
                setIsDetecting(false);
              }
            }}
          />
        </div>

        {/* Right Column: Configuration Form */}
        <div className="border border-border rounded-xl p-6 bg-bg/50 self-start relative">
          {isDetecting && (
            <div className="absolute inset-0 z-10 bg-bg/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
              <div className="px-4 py-2 bg-surface text-sm font-medium rounded-full border border-border shadow-lg flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Detecting framework...
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold mb-4">Configure Project</h2>
          <form action={createProject} className="space-y-5">
            <input type="hidden" name="repoFullName" value={selectedRepo?.fullName || ""} />
            <input type="hidden" name="defaultBranch" value={selectedRepo?.defaultBranch || "main"} />

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-text">Project Name</label>
              <input
                id="name"
                name="name"
                required
                placeholder="my-awesome-app"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1.5 text-text">Description <span className="text-muted font-normal">(optional)</span></label>
              <input
                id="description"
                name="description"
                placeholder="A short description of your project"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
              />
            </div>

            <div>
              <label htmlFor="gitUrl" className="block text-sm font-medium mb-1.5 text-text">Git Repository URL</label>
              <input
                id="gitUrl"
                name="gitUrl"
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
              />
            </div>

            {/* Package Manager */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-text">Package Manager</label>
              <div className="grid grid-cols-4 gap-2">
                {(["npm", "pnpm", "yarn", "bun"] as PackageManager[]).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => {
                      setPackageManager(pm);
                      const fwSelect = document.getElementById("framework") as HTMLSelectElement;
                      if (fwSelect?.value) applyFramework(fwSelect.value, pm);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      packageManager === pm
                        ? "bg-accent text-white border-accent"
                        : "bg-bg border-border text-text hover:bg-surface"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="framework" className="block text-sm font-medium mb-1.5 text-text">Framework Preset</label>
              <select
                id="framework"
                name="framework"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
                onChange={(e) => applyFramework(e.target.value, packageManager)}
              >
                <option value="">Custom</option>
                {frameworks.map((fw) => (
                  <option key={fw.value} value={fw.value}>{fw.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="buildCommand" className="block text-sm font-medium mb-1.5 text-text">Build Command</label>
                <input
                  id="buildCommand"
                  name="buildCommand"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
                />
              </div>
              <div>
                <label htmlFor="outputDir" className="block text-sm font-medium mb-1.5 text-text">Output Directory</label>
                <input
                  id="outputDir"
                  name="outputDir"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="installCommand" className="block text-sm font-medium mb-1.5 text-text">Install Command</label>
              <input
                id="installCommand"
                name="installCommand"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-bg transition-colors"
              />
            </div>

            {selectedRepo && (
              <label className="flex items-start gap-3 p-4 border border-border rounded-xl bg-surface/30 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="createWebhook"
                  defaultChecked
                  className="w-4 h-4 mt-0.5 rounded border-gray-300"
                />
                <div className="text-sm">
                  <span className="font-medium block mb-0.5">Auto-create webhook</span>
                  <p className="text-xs text-muted">Automatically deploy on every push to <span className="font-medium text-text">{selectedRepo.fullName}</span></p>
                </div>
              </label>
            )}

            <div className="flex items-center gap-3 pt-6 border-t border-border mt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors w-full justify-center"
              >
                Deploy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
