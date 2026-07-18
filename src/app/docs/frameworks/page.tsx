"use client";

import { useState, useMemo } from "react";
import { Sparkles, Terminal, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { LANGUAGES, type LanguageProfile } from "@/lib/languages";

type LangGroup =
  | "JavaScript / TypeScript"
  | "Node.js / Backend"
  | "Python"
  | "Go"
  | "Rust"
  | "Ruby"
  | "PHP"
  | "Java / Kotlin / Scala"
  | ".NET"
  | "Elixir"
  | "Dart / Flutter"
  | "Swift"
  | "C / C++"
  | "Lua"
  | "Haskell"
  | "R"
  | "Perl"
  | "Zig"
  | "OCaml"
  | "Erlang"
  | "Static / HTML"
  | "WebAssembly"
  | "Mobile / Cross-platform"
  | "Other";

const GROUP_ORDER: LangGroup[] = [
  "JavaScript / TypeScript",
  "Node.js / Backend",
  "Python",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Java / Kotlin / Scala",
  ".NET",
  "Elixir",
  "Dart / Flutter",
  "Swift",
  "C / C++",
  "Lua",
  "Haskell",
  "R",
  "Perl",
  "Zig",
  "OCaml",
  "Erlang",
  "Static / HTML",
  "WebAssembly",
  "Mobile / Cross-platform",
  "Other",
];

const LANG_GROUP_MAP: Record<string, LangGroup> = {
  // JS/TS frontend
  nextjs: "JavaScript / TypeScript", "nextjs-static": "JavaScript / TypeScript",
  "react-vite": "JavaScript / TypeScript", vue: "JavaScript / TypeScript",
  nuxt: "JavaScript / TypeScript", sveltekit: "JavaScript / TypeScript",
  remix: "JavaScript / TypeScript", astro: "JavaScript / TypeScript",
  gatsby: "JavaScript / TypeScript", angular: "JavaScript / TypeScript",
  "ember.js": "JavaScript / TypeScript", ember: "JavaScript / TypeScript",
  solidjs: "JavaScript / TypeScript", qwik: "JavaScript / TypeScript",
  "remix-vite": "JavaScript / TypeScript", hexo: "JavaScript / TypeScript",
  docusaurus: "JavaScript / TypeScript", vitepress: "JavaScript / TypeScript",
  hugo: "Static / HTML", jekyll: "Static / HTML",
  // Node.js backend
  express: "Node.js / Backend", fastify: "Node.js / Backend",
  nestjs: "Node.js / Backend", adonisjs: "Node.js / Backend",
  hono: "Node.js / Backend", nitro: "Node.js / Backend",
  elysiajs: "Node.js / Backend", elysia: "Node.js / Backend",
  lynx: "Node.js / Backend",
  // Python
  django: "Python", flask: "Python", fastapi: "Python",
  starlette: "Python", sanic: "Python", bottle: "Python",
  quart: "Python", tornado: "Python", gunicorn: "Python",
  "static-python": "Python",
  // Go
  go: "Go", echo: "Go", gin: "Go", fiber: "Go",
  "hugo-go": "Static / HTML",
  // Rust
  rust: "Rust", actix: "Rust", axum: "Rust",
  rocket: "Rust", warp: "Rust", leptos: "Rust", dioxus: "Rust",
  // Ruby
  rails: "Ruby", sinatra: "Ruby", hanami: "Ruby", "ruby-static": "Ruby",
  // PHP
  laravel: "PHP", symfony: "PHP", wordpress: "PHP", "static-php": "PHP",
  // Java/Kotlin/Scala
  "spring-boot": "Java / Kotlin / Scala", "spring-boot-gradle": "Java / Kotlin / Scala",
  kotlin: "Java / Kotlin / Scala", scala: "Java / Kotlin / Scala",
  micronaut: "Java / Kotlin / Scala", quarkus: "Java / Kotlin / Scala",
  vertx: "Java / Kotlin / Scala", clojure: "Java / Kotlin / Scala",
  // .NET
  dotnet: ".NET", blazor: ".NET", maui: ".NET",
  // Elixir
  phoenix: "Elixir", elixir: "Elixir",
  // Dart
  flutter: "Dart / Flutter", dart: "Dart / Flutter", "dart-shelf": "Dart / Flutter",
  // Swift
  vapor: "Swift", swift: "Swift",
  // C/C++
  cpp: "C / C++", c: "C / C++", crow: "C / C++", drogon: "C / C++",
  // Lua
  openresty: "Lua", lapis: "Lua",
  // Haskell
  haskell: "Haskell", servant: "Haskell", yesod: "Haskell",
  // R
  shiny: "R", plumber: "R",
  // Perl
  "perl-dancer": "Perl", mojolicious: "Perl",
  // Zig
  zig: "Zig",
  // OCaml
  ocaml: "OCaml",
  // Erlang
  erlang: "Erlang",
  // Static
  html: "Static / HTML", netlify: "Static / HTML",
  // WASM
  wasm: "WebAssembly",
  // Mobile
  "react-native": "Mobile / Cross-platform", capacitor: "Mobile / Cross-platform",
};

function getLangGroup(lang: LanguageProfile): LangGroup {
  return LANG_GROUP_MAP[lang.id] || "Other";
}

export default function FrameworksPage() {
  const [selectedId, setSelectedId] = useState<string>("nextjs");
  const [search, setSearch] = useState("");
  const [validationState, setValidationState] = useState<"idle" | "checking" | "success" | "error">("idle");

  const selected = LANGUAGES.find((l) => l.id === selectedId);

  const grouped = useMemo(() => {
    const groups: Record<string, LanguageProfile[]> = {};
    const filtered = search
      ? LANGUAGES.filter(
          (l) =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.id.toLowerCase().includes(search.toLowerCase())
        )
      : LANGUAGES;

    for (const lang of filtered) {
      const g = getLangGroup(lang);
      if (!groups[g]) groups[g] = [];
      groups[g].push(lang);
    }

    return GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({
      group: g,
      langs: groups[g],
    }));
  }, [search]);

  const generateGrobJson = () => {
    if (!selected) return "{}";
    const isStatic =
      selected.build.length === 0 &&
      selected.outputDirs.length <= 1 &&
      selected.outputDirs[0] === ".";
    return JSON.stringify(
      {
        version: 2,
        framework: selected.id,
        name: selected.name,
        build: {
          install: selected.install.join(" && "),
          command: selected.build.join(" && "),
          output: selected.outputDirs[0] || ".",
        },
        runtime: {
          start: selected.startCommand(3000, ".").cmd,
          args: selected.startCommand(3000, ".").args,
          ...(selected.env ? { env: selected.env } : {}),
        },
      },
      null,
      2
    );
  };

  const testConfig = () => {
    setValidationState("checking");
    setTimeout(() => {
      setValidationState(selected ? "success" : "error");
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-2 text-sm font-semibold tracking-wider text-accent uppercase">Getting Started</div>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
        Frameworks &amp; Languages
      </h1>
      <p className="mb-6 text-lg text-muted leading-relaxed">
        Grob supports <span className="font-semibold text-text">70+ frameworks</span> across 15+ languages.
        Our deploy pipelines auto-detect your stack and configure the build environment — JavaScript, Python,
        Go, Rust, Ruby, PHP, Java, .NET, Elixir, Dart, Swift, C/C++, and more.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          placeholder="Search frameworks (e.g. Next.js, Django, Rust, Laravel...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-text placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Framework selector */}
      <div className="space-y-5 mb-8 max-h-[420px] overflow-y-auto pr-1 scrollbar-hidden">
        {grouped.map(({ group, langs }) => (
          <div key={group}>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1.5 px-1">
              {group}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {langs.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedId(lang.id);
                    setValidationState("idle");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    selectedId === lang.id
                      ? "bg-accent/10 text-accent border-accent/40 shadow-sm"
                      : "text-muted hover:text-text border-transparent hover:border-border"
                  }`}
                >
                  <span className="mr-1">{lang.icon}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Card Grid */}
      {selected && (
        <div className="grid gap-4 sm:grid-cols-2 mb-8 text-sm">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="font-bold text-text mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-accent" /> Settings for {selected.name}
            </h3>
            <ul className="space-y-3 font-semibold">
              {selected.install.length > 0 && (
                <li className="flex justify-between border-b border-border/60 pb-2 gap-4">
                  <span className="text-muted font-medium shrink-0">Install:</span>
                  <code className="text-xs bg-bg px-2 py-0.5 rounded text-accent font-mono text-right break-all">
                    {selected.install.join(" && ")}
                  </code>
                </li>
              )}
              {selected.build.length > 0 && (
                <li className="flex justify-between border-b border-border/60 pb-2 gap-4">
                  <span className="text-muted font-medium shrink-0">Build:</span>
                  <code className="text-xs bg-bg px-2 py-0.5 rounded text-accent font-mono text-right break-all">
                    {selected.build.join(" && ")}
                  </code>
                </li>
              )}
              <li className="flex justify-between pb-1 gap-4">
                <span className="text-muted font-medium shrink-0">Output:</span>
                <code className="text-xs bg-bg px-2 py-0.5 rounded text-accent font-mono text-right break-all">
                  {selected.outputDirs.join(", ") || "."}
                </code>
              </li>
              {selected.configFiles.length > 0 && (
                <li className="flex justify-between border-t border-border/60 pt-2 gap-4">
                  <span className="text-muted font-medium shrink-0">Config files:</span>
                  <code className="text-xs bg-bg px-2 py-0.5 rounded text-muted font-mono text-right break-all">
                    {selected.configFiles.join(", ")}
                  </code>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-text mb-3">Runtime &amp; Start Command</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-bg/60 border border-border p-3">
                  <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-1">Start command</span>
                  <code className="text-xs text-accent font-mono break-all">
                    {selected.startCommand(3000, ".").cmd}{" "}
                    {selected.startCommand(3000, ".").args.join(" ")}
                  </code>
                </div>
                {selected.env && Object.keys(selected.env).length > 0 && (
                  <div className="rounded-lg bg-bg/60 border border-border p-3">
                    <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-1">Environment</span>
                    <div className="space-y-1">
                      {Object.entries(selected.env).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs font-mono">
                          <span className="text-accent">{k}:</span>
                          <span className="text-muted">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.extensions.length > 0 && (
                  <div className="rounded-lg bg-bg/60 border border-border p-3">
                    <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block mb-1">File extensions</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selected.extensions.map((ext) => (
                        <span key={ext} className="text-[10px] font-mono text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON Generator & Validator */}
      <h2 className="text-lg font-bold text-text mb-4">Grob Config JSON Generator</h2>
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-lg mb-12">
        <div className="flex items-center justify-between border-b border-border bg-bg/40 px-4 py-2 text-xs">
          <span className="font-mono text-muted flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-accent" /> grob.json
          </span>
          <button
            onClick={testConfig}
            className="px-3 py-1 rounded bg-accent text-white font-bold hover:brightness-110 transition-colors cursor-pointer"
          >
            Test Configuration
          </button>
        </div>

        <div className="p-4 bg-black/95 text-white font-mono text-xs overflow-x-auto leading-relaxed max-h-[300px] overflow-y-auto">
          <pre>{generateGrobJson()}</pre>
        </div>

        {validationState === "checking" && (
          <div className="border-t border-border bg-bg/30 p-3 flex items-center justify-center gap-2 text-sm">
            <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-muted">Validating configuration...</span>
          </div>
        )}
        {validationState === "success" && (
          <div className="border-t border-success/20 bg-success/5 p-3.5 flex items-center gap-2.5 text-sm text-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-semibold">
              Configuration is valid! Save as{" "}
              <code className="bg-success/15 px-1 py-0.5 rounded font-mono">grob.json</code> in your repository root.
            </span>
          </div>
        )}
        {validationState === "error" && (
          <div className="border-t border-error/20 bg-error/5 p-3.5 flex items-center gap-2.5 text-sm text-error">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Please select a framework first.</span>
          </div>
        )}
      </div>
    </div>
  );
}
