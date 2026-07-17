"use client";

/**
 * Grob — Homepage
 *
 * Dependencies (install if not already present):
 *   npm install framer-motion lucide-react
 *
 * Design tokens:
 *   bg        #0B0E14  (charcoal-navy, not pure black)
 *   surface   #12151D
 *   border    #212633
 *   text      #E7E9EE
 *   muted     #8B92A4
 *   accent    #6E5BFF  (violet — primary)
 *   success   #3DDC97  (mint — reserved for deploy/success states only)
 *   signal    #FFB020  (amber — warnings/build-in-progress)
 *
 * Type: Space Grotesk (display) / Inter (body) / JetBrains Mono (console, code)
 * Add to your root layout <head> if not already loaded:
 *   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
 */

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import { GitBranch, RotateCcw, ShieldCheck, ArrowRight } from "lucide-react";

import { Pipeline } from "@/components/Pipeline";
import { PowerfulFeatures } from "@/components/PowerfulFeatures";
import { FAQ } from "@/components/FAQ";
import { ContactFooter } from "@/components/ContactFooter";
import PublicNavbar from "@/components/PublicNavbar";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ---------------------------------------------------------------------------
// Hero build console — the page's signature element.
// Types out a realistic deploy log line by line, then loops.
// ---------------------------------------------------------------------------

const LOG_LINES = [
  { text: "$ git push origin main", kind: "cmd" },
  { text: "→ Detected Next.js 14 project", kind: "info" },
  { text: "→ Installing dependencies…", kind: "info" },
  { text: "✓ Dependencies installed (4.2s)", kind: "ok" },
  { text: "→ Running build…", kind: "info" },
  { text: "✓ Build completed (11.8s)", kind: "ok" },
  { text: "→ Uploading to edge network…", kind: "info" },
  { text: "✓ Deployed to production", kind: "ok" },
  { text: "● grob-app.grob.app is live", kind: "live" },
] as const;

function BuildConsole() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let line = 0;
    let char = 0;
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function schedule(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    }

    function restart() {
      line = 0;
      char = 0;
      setVisibleLines(0);
      setCharCount(0);
      schedule(() => typeLoop(), 300);
    }

    function typeLoop() {
      if (cancelled) return;
      const target = LOG_LINES[line].text.length;
      if (char <= target) {
        setVisibleLines(line + 1);
        setCharCount(char);
        char += Math.max(1, Math.floor(target / 22));
        schedule(typeLoop, 14);
      } else {
        line += 1;
        char = 0;
        if (line >= LOG_LINES.length) {
          schedule(restart, 3000);
        } else {
          schedule(typeLoop, 180);
        }
      }
    }

    schedule(typeLoop, 300);
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [inView]);

  const kindColor: Record<string, string> = {
    cmd: "text-text",
    info: "text-muted",
    ok: "text-success",
    live: "text-success",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-[0_0_0_1px_rgba(110,91,255,0.08),0_20px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
        <span className="ml-3 font-mono text-xs text-muted">deploy.log</span>
      </div>

      <div className="h-[280px] overflow-hidden px-5 py-4 font-mono text-[13px] leading-6">
        {LOG_LINES.slice(0, visibleLines).map((l, i) => {
          const isCurrent = i === visibleLines - 1;
          const text = isCurrent ? l.text.slice(0, charCount) : l.text;
          return (
            <div key={i} className={kindColor[l.kind]}>
              {text}
              {isCurrent && charCount < l.text.length && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-accent align-middle" />
              )}
            </div>
          );
        })}
        {visibleLines >= LOG_LINES.length && (
          <div className="mt-2 flex items-center gap-1.5 text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs text-muted">watching for changes…</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline steps — a genuine sequence, so numbering is earned here.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Feature cards
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: GitBranch,
    title: "Git integration",
    desc: "Connect any repository. Every push builds a preview automatically, no config required.",
  },
  {
    icon: RotateCcw,
    title: "Instant rollbacks",
    desc: "Every deploy is kept. Roll back to any previous version in one click, with zero downtime.",
  },
  {
    icon: ShieldCheck,
    title: "Custom domains",
    desc: "Point a domain and get SSL automatically. No certificates to manage, ever.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  desc,
  i,
}: {
  icon: typeof GitBranch;
  title: string;
  desc: string;
  i: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      custom={i}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group rounded-xl border border-border bg-surface p-6 transition-colors"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
        <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
      </div>
      <h3 className="mb-2 font-semibold text-text">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{desc}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);
  const heroY = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <div className="min-h-screen bg-bg font-[Inter,sans-serif] text-text">
      {/* Full-viewport decorative canvas */}
      <div className="pointer-events-none fixed inset-0 select-none">
        {/* Main glow — violet splash */}
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-[0.15] blur-[140px]" />
        <div className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-success opacity-[0.08] blur-[120px]" />
        <div className="absolute -left-20 bottom-1/4 h-[300px] w-[300px] rounded-full bg-signal opacity-[0.06] blur-[100px]" />

        {/* Stars */}
        <svg
          className="absolute left-[12%] top-[18%] h-5 w-5 text-accent/50 animate-[pulse_3s_ease-in-out_infinite]"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
        </svg>
        <svg
          className="absolute right-[20%] top-[12%] h-3 w-3 text-success/50 animate-[pulse_4s_ease-in-out_infinite_1s]"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
        </svg>
        <svg
          className="absolute left-[8%] bottom-[28%] h-4 w-4 text-signal/45 animate-[pulse_3.5s_ease-in-out_infinite_0.5s]"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
        </svg>
        <svg
          className="absolute right-[8%] bottom-[18%] h-3.5 w-3.5 text-accent/40 animate-[pulse_4.5s_ease-in-out_infinite_2s]"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
        </svg>
        <svg
          className="absolute left-[48%] top-[6%] h-2.5 w-2.5 text-white/30 animate-[pulse_3s_ease-in-out_infinite_1.5s]"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5z" />
        </svg>

        {/* Dots */}
        <span className="absolute left-[22%] top-[42%] h-1.5 w-1.5 rounded-full bg-accent/40 animate-[pulse_4s_ease-in-out_infinite_0.3s]" />
        <span className="absolute right-[10%] top-[45%] h-2 w-2 rounded-full bg-success/35 animate-[pulse_3.5s_ease-in-out_infinite_0.8s]" />
        <span className="absolute left-[5%] top-[60%] h-1.5 w-1.5 rounded-full bg-white/20 animate-[pulse_4s_ease-in-out_infinite_1.2s]" />
        <span className="absolute right-[35%] bottom-[12%] h-2 w-2 rounded-full bg-signal/35 animate-[pulse_3s_ease-in-out_infinite_0.5s]" />

        {/* Decorative rings — right side */}
        <svg
          className="absolute -right-12 top-1/3 h-80 w-80 -translate-y-1/2 text-accent/[0.06]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
        >
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="32" />
          <circle cx="50" cy="50" r="22" />
          <circle cx="50" cy="50" r="12" />
        </svg>
      </div>

      {/* Nav */}
      <PublicNavbar />

      <main>
        {/* Hero */}
        <motion.section
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8"
        >
          <div className="grid w-full items-center gap-16 lg:grid-cols-2">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                All systems operational
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-[Space_Grotesk,sans-serif] text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl"
              >
                Push code.
                <br />
                Watch it <span className="text-accent">go live</span>.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-lg text-lg leading-relaxed text-muted"
              >
                Import your Git repository, and Grob builds, deploys, and serves
                it from the edge — with zero configuration and zero downtime.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white transition-colors hover:brightness-110"
                >
                  Start deploying
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-base font-medium text-text transition-colors hover:bg-surface"
                >
                  View docs
                </Link>
              </motion.div>
            </motion.div>

            <div className="flex justify-center lg:justify-end">
              <BuildConsole />
            </div>
          </div>
        </motion.section>

        {/* Pipeline */}
        <Pipeline />

        {/* Powerful Features */}
        <PowerfulFeatures />

        {/* FAQ */}
        <FAQ />
      </main>

      <ContactFooter />
    </div>
  );
}
