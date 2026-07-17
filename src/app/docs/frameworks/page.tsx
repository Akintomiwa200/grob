"use client";

import { useState } from "react";
import { Sparkles, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

type FrameworkKey = "next" | "react" | "vue" | "svelte" | "astro" | "express" | "django" | "fastapi" | "go" | "rust" | "rails" | "laravel";

export default function FrameworksPage() {
  const [activeFw, setActiveFw] = useState<FrameworkKey>("next");
  const [nodeVersion, setNodeVersion] = useState("20.x");
  const [staticExport, setStaticExport] = useState(false);
  const [pythonVersion, setPythonVersion] = useState("3.11");
  const [goVersion, setGoVersion] = useState("1.22");
  const [rustVersion, setRustVersion] = useState("stable");
  const [phpVersion, setPhpVersion] = useState("8.3");
  const [rubyVersion, setRubyVersion] = useState("3.3");
  const [validationState, setValidationState] = useState<"idle" | "checking" | "success" | "error">("idle");

  const frameworkDetails = {
    next: { name: "Next.js", type: "Frontend", install: "npm install", build: "next build", output: ".next", config: "next.config.js" },
    react: { name: "React (Vite)", type: "Frontend", install: "npm install", build: "vite build", output: "dist", config: "vite.config.js" },
    vue: { name: "Vue & Nuxt", type: "Frontend", install: "npm install", build: "nuxt build", output: ".output/public", config: "nuxt.config.ts" },
    svelte: { name: "SvelteKit", type: "Frontend", install: "npm install", build: "npm run build", output: ".svelte-kit", config: "svelte.config.js" },
    astro: { name: "Astro", type: "Frontend", install: "npm install", build: "astro build", output: "dist", config: "astro.config.mjs" },
    express: { name: "Node Express", type: "Backend", install: "npm install", build: "— (None Required)", output: ".", config: "package.json" },
    django: { name: "Python Django", type: "Backend", install: "pip install -r requirements.txt", build: "python manage.py collectstatic --noinput", output: "staticfiles", config: "manage.py" },
    fastapi: { name: "Python FastAPI", type: "Backend", install: "pip install -r requirements.txt", build: "— (None Required)", output: ".", config: "main.py" },
    go: { name: "Go (Echo/Gin)", type: "Backend", install: "go mod download", build: "go build -o server .", output: ".", config: "go.mod" },
    rust: { name: "Rust (Actix/Axum)", type: "Backend", install: "cargo fetch", build: "cargo build --release", output: "target/release", config: "Cargo.toml" },
    rails: { name: "Ruby on Rails", type: "Backend", install: "bundle install", build: "bundle exec rake assets:precompile", output: "public/assets", config: "Gemfile" },
    laravel: { name: "PHP Laravel", type: "Backend", install: "composer install --no-dev", build: "php artisan config:cache", output: "public", config: "composer.json" }
  };

  const getBuildCommand = () => {
    const fw = frameworkDetails[activeFw];
    if (activeFw === "next" && staticExport) return "next build && next export";
    return fw.build;
  };

  const getOutputDir = () => {
    const fw = frameworkDetails[activeFw];
    if (activeFw === "next" && staticExport) return "out";
    return fw.output;
  };

  const generateGrobJson = () => {
    const runtimeConfig: Record<string, string> = {};
    if (["next", "react", "vue", "svelte", "astro", "express"].includes(activeFw)) {
      runtimeConfig.nodeVersion = nodeVersion;
    } else if (["django", "fastapi"].includes(activeFw)) {
      runtimeConfig.pythonVersion = pythonVersion;
    } else if (activeFw === "go") {
      runtimeConfig.goVersion = goVersion;
    } else if (activeFw === "rust") {
      runtimeConfig.rustVersion = rustVersion;
    } else if (activeFw === "laravel") {
      runtimeConfig.phpVersion = phpVersion;
    } else if (activeFw === "rails") {
      runtimeConfig.rubyVersion = rubyVersion;
    }

    return JSON.stringify({
      version: 2,
      framework: activeFw,
      build: {
        command: getBuildCommand(),
        directory: getOutputDir(),
        ...runtimeConfig
      },
      routing: {
        cleanUrls: true,
        trailingSlash: false
      }
    }, null, 2);
  };

  const testConfig = () => {
    setValidationState("checking");
    setTimeout(() => {
      if (nodeVersion === "14.x" && activeFw === "next") {
        setValidationState("error");
      } else {
        setValidationState("success");
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Getting Started</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Frameworks &amp; Languages
      </h1>
      <p className="mb-8 text-lg text-muted leading-relaxed">
        Grob supports both static frontend frameworks and backend servers/APIs. Our deploy pipelines automatically configure building environments for JavaScript, Python, Go, Rust, Ruby, and PHP runtimes.
      </p>

      {/* Selector Tabs grouped by category */}
      <div className="space-y-4 mb-8">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2 px-1">Frontend Frameworks</span>
          <div className="flex bg-bg/40 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-hidden border border-border">
            {(Object.keys(frameworkDetails) as FrameworkKey[])
              .filter(k => frameworkDetails[k].type === "Frontend")
              .map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveFw(key);
                    setValidationState("idle");
                  }}
                  className={`px-4.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    activeFw === key
                      ? "bg-surface text-accent shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {frameworkDetails[key].name}
                </button>
              ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2 px-1">Backend Languages &amp; Servers</span>
          <div className="flex bg-bg/40 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-hidden border border-border">
            {(Object.keys(frameworkDetails) as FrameworkKey[])
              .filter(k => frameworkDetails[k].type === "Backend")
              .map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveFw(key);
                    setValidationState("idle");
                  }}
                  className={`px-4.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    activeFw === key
                      ? "bg-surface text-accent shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {frameworkDetails[key].name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Info Card Grid */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8 text-sm">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="font-bold text-text mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-accent" /> Settings for {frameworkDetails[activeFw].name}
          </h3>
          <ul className="space-y-3 font-semibold">
            <li className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted font-medium">Install command:</span>
              <code className="text-xs bg-bg px-2 py-0.5 rounded text-accent font-mono">{frameworkDetails[activeFw].install}</code>
            </li>
            <li className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted font-medium">Build command:</span>
              <code className="text-xs bg-bg px-2 py-0.5 rounded text-accent font-mono">{getBuildCommand()}</code>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-muted font-medium">Output directory:</span>
              <code className="text-xs bg-bg px-2 py-0.5 rounded text-accent font-mono">{getOutputDir()}</code>
            </li>
          </ul>
        </div>

        {/* Runtime config sliders/dropdowns */}
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-text mb-3">Language Version settings</h3>
            <div className="space-y-4">
              {/* JS Nodes */}
              {["next", "react", "vue", "svelte", "astro", "express"].includes(activeFw) && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Node.js Version</label>
                  <select
                    value={nodeVersion}
                    onChange={(e) => {
                      setNodeVersion(e.target.value);
                      setValidationState("idle");
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="20.x">Node.js 20.x (Recommended)</option>
                    <option value="18.x">Node.js 18.x</option>
                    <option value="16.x">Node.js 16.x</option>
                    <option value="14.x">Node.js 14.x (Legacy)</option>
                  </select>
                </div>
              )}

              {/* Python */}
              {["django", "fastapi"].includes(activeFw) && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Python Version</label>
                  <select
                    value={pythonVersion}
                    onChange={(e) => {
                      setPythonVersion(e.target.value);
                      setValidationState("idle");
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="3.12">Python 3.12 (Recommended)</option>
                    <option value="3.11">Python 3.11</option>
                    <option value="3.10">Python 3.10</option>
                    <option value="3.9">Python 3.9</option>
                  </select>
                </div>
              )}

              {/* Go */}
              {activeFw === "go" && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Go Version</label>
                  <select
                    value={goVersion}
                    onChange={(e) => {
                      setGoVersion(e.target.value);
                      setValidationState("idle");
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="1.22">Go 1.22 (Recommended)</option>
                    <option value="1.21">Go 1.21</option>
                    <option value="1.20">Go 1.20</option>
                  </select>
                </div>
              )}

              {/* Rust */}
              {activeFw === "rust" && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Rust Toolchain</label>
                  <select
                    value={rustVersion}
                    onChange={(e) => {
                      setRustVersion(e.target.value);
                      setValidationState("idle");
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="stable">stable (Recommended)</option>
                    <option value="beta">beta</option>
                    <option value="nightly">nightly</option>
                  </select>
                </div>
              )}

              {/* PHP */}
              {activeFw === "laravel" && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">PHP Engine Version</label>
                  <select
                    value={phpVersion}
                    onChange={(e) => {
                      setPhpVersion(e.target.value);
                      setValidationState("idle");
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="8.3">PHP 8.3 (Recommended)</option>
                    <option value="8.2">PHP 8.2</option>
                    <option value="8.1">PHP 8.1</option>
                  </select>
                </div>
              )}

              {/* Ruby */}
              {activeFw === "rails" && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Ruby Version</label>
                  <select
                    value={rubyVersion}
                    onChange={(e) => {
                      setRubyVersion(e.target.value);
                      setValidationState("idle");
                    }}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="3.3">Ruby 3.3 (Recommended)</option>
                    <option value="3.2">Ruby 3.2</option>
                    <option value="3.1">Ruby 3.1</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JSON File Generator & Validator */}
      <h2 className="text-lg font-bold text-text mb-4">Grob Config JSON Generator</h2>
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-lg mb-12">
        <div className="flex items-center justify-between border-b border-border bg-bg/40 px-4 py-2 text-xs">
          <span className="font-mono text-muted flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-accent" /> grob.json
          </span>
          <div>
            <button
              onClick={testConfig}
              className="px-3 py-1 rounded bg-accent text-white font-bold hover:brightness-110 transition-colors cursor-pointer"
            >
              Test Configuration
            </button>
          </div>
        </div>

        <div className="p-4 bg-black/95 text-white font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{generateGrobJson()}</pre>
        </div>

        {/* Validation Output Alert */}
        {validationState === "checking" && (
          <div className="border-t border-border bg-bg/30 p-3 flex items-center justify-center gap-2 text-sm">
            <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-muted">Checking schema constraints...</span>
          </div>
        )}

        {validationState === "success" && (
          <div className="border-t border-success/20 bg-success/5 p-3.5 flex items-center gap-2.5 text-sm text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Configuration is valid! Save this configuration as <code className="bg-success/15 px-1 py-0.5 rounded font-mono">grob.json</code> to configure the runtime settings in your repository.</span>
          </div>
        )}

        {validationState === "error" && (
          <div className="border-t border-error/20 bg-error/5 p-3.5 flex items-center gap-2.5 text-sm text-error">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Schema Error: Next.js deployments require Node.js 18.x or above. Select a newer runtime.</span>
          </div>
        )}
      </div>
    </div>
  );
}
