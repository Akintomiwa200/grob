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
import {
  GitBranch,
  Hammer,
  Rocket,
  Globe2,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";

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
  { text: "● grob-app.vercel.build is live", kind: "live" },
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

    function typeNext() {
      if (cancelled || line >= LOG_LINES.length) return;
      const target = LOG_LINES[line].text.length;
      if (char <= target) {
        setVisibleLines(line + 1);
        setCharCount(char);
        char += Math.max(1, Math.floor(target / 22));
        setTimeout(typeNext, 14);
      } else {
        line += 1;
        char = 0;
        setTimeout(typeNext, line === LOG_LINES.length ? 0 : 180);
      }
    }
    const t = setTimeout(typeNext, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [inView]);

  const kindColor: Record<string, string> = {
    cmd: "text-[#E7E9EE]",
    info: "text-[#8B92A4]",
    ok: "text-[#3DDC97]",
    live: "text-[#3DDC97]",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md rounded-2xl border border-[#212633] bg-[#12151D] shadow-[0_0_0_1px_rgba(110,91,255,0.08),0_20px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-[#212633] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
        <span className="ml-3 font-mono text-xs text-[#8B92A4]">
          deploy.log
        </span>
      </div>

      <div className="h-[280px] overflow-hidden px-5 py-4 font-mono text-[13px] leading-6">
        {LOG_LINES.slice(0, visibleLines).map((l, i) => {
          const isCurrent = i === visibleLines - 1;
          const text = isCurrent ? l.text.slice(0, charCount) : l.text;
          return (
            <div key={i} className={kindColor[l.kind]}>
              {text}
              {isCurrent && charCount < l.text.length && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[#6E5BFF] align-middle" />
              )}
            </div>
          );
        })}
        {visibleLines >= LOG_LINES.length && (
          <div className="mt-2 flex items-center gap-1.5 text-[#3DDC97]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DDC97] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3DDC97]" />
            </span>
            <span className="text-xs text-[#8B92A4]">
              watching for changes…
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline steps — a genuine sequence, so numbering is earned here.
// ---------------------------------------------------------------------------

const STEPS = [
  { icon: GitBranch, label: "Push", desc: "git push to any branch" },
  { icon: Hammer, label: "Build", desc: "Detected & compiled automatically" },
  { icon: Rocket, label: "Deploy", desc: "Shipped to the edge globally" },
  { icon: Globe2, label: "Live", desc: "SSL & domain ready instantly" },
];

function Pipeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="relative"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-xs text-[#6E5BFF]">0{i + 1}</span>
              <div className="h-px flex-1 bg-[#212633]" />
            </div>
            <s.icon
              className="mb-3 h-5 w-5 text-[#E7E9EE]"
              strokeWidth={1.75}
            />
            <h3 className="mb-1 font-semibold text-[#E7E9EE]">{s.label}</h3>
            <p className="text-sm text-[#8B92A4]">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

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
      whileHover={{ y: -4, borderColor: "#6E5BFF66" }}
      transition={{ duration: 0.25 }}
      className="group rounded-xl border border-[#212633] bg-[#12151D] p-6 transition-colors"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#6E5BFF]/10 transition-colors group-hover:bg-[#6E5BFF]/20">
        <Icon className="h-5 w-5 text-[#6E5BFF]" strokeWidth={1.75} />
      </div>
      <h3 className="mb-2 font-semibold text-[#E7E9EE]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#8B92A4]">{desc}</p>
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
    <div className="min-h-screen bg-[#0B0E14] font-[Inter,sans-serif] text-[#E7E9EE]">
      {/* ambient grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#E7E9EE 1px, transparent 1px), linear-gradient(90deg, #E7E9EE 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-[#212633] bg-[#0B0E14]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6E5BFF]">
              <span className="font-[Space_Grotesk,sans-serif] text-sm font-bold text-white">
                G
              </span>
            </div>
            <span className="font-[Space_Grotesk,sans-serif] text-xl font-bold">
              Grob
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#8B92A4] transition-colors hover:text-[#E7E9EE]"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-[#6E5BFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7D6BFF]"
            >
              Get started
            </Link>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero */}
        <motion.section
          style={{ opacity: heroOpacity, y: heroY }}
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8"
        >
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#212633] bg-[#12151D] px-3 py-1 text-xs text-[#8B92A4]"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DDC97] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3DDC97]" />
                </span>
                All systems operational
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-[Space_Grotesk,sans-serif] text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl"
              >
                Push code.
                <br />
                Watch it <span className="text-[#6E5BFF]">go live</span>.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-lg text-lg leading-relaxed text-[#8B92A4]"
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
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#6E5BFF] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#7D6BFF]"
                >
                  Start deploying
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg border border-[#212633] px-6 py-3 text-base font-medium text-[#E7E9EE] transition-colors hover:bg-[#12151D]"
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
        <section className="border-t border-[#212633] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 font-mono text-xs uppercase tracking-widest text-[#6E5BFF]"
            >
              From commit to production
            </motion.p>
            <Pipeline />
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[#212633] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} i={i} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t border-[#212633] py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
          >
            <h2 className="font-[Space_Grotesk,sans-serif] text-3xl font-bold tracking-tight md:text-4xl">
              Ship your next project today
            </h2>
            <p className="mt-4 text-[#8B92A4]">
              Free for personal projects. No credit card required.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#6E5BFF] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#7D6BFF]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-[#212633] py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-sm text-[#8B92A4] sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Grob</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-[#E7E9EE]">
              Docs
            </Link>
            <Link href="/login" className="hover:text-[#E7E9EE]">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
