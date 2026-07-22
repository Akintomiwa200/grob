"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FRAMEWORKS = [
  { name: "Next.js", letter: "N" },
  { name: "React", letter: "R" },
  { name: "Vue", letter: "V" },
  { name: "Svelte", letter: "S" },
  { name: "Angular", letter: "A" },
  { name: "Nuxt", letter: "N" },
  { name: "Remix", letter: "R" },
  { name: "Astro", letter: "A" },
  { name: "Laravel", letter: "L" },
  { name: "Django", letter: "D" },
  { name: "Rails", letter: "R" },
  { name: "Go", letter: "Go" },
  { name: "Rust", letter: "Rs" },
  { name: "Spring", letter: "Sp" },
  { name: "FastAPI", letter: "F" },
  { name: "Flask", letter: "F" },
  { name: "Express", letter: "E" },
  { name: "Nest", letter: "N" },
  { name: "Python", letter: "Py" },
  { name: "Ruby", letter: "Rb" },
];

export function FrameworkShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={fadeUp}
          className="text-center"
        >
          <p className="mb-3 text-sm font-medium text-muted">
            Auto-detected from your repository
          </p>
          <h2 className="font-[Space_Grotesk,sans-serif] text-3xl font-bold tracking-tight sm:text-4xl">
            70+ frameworks.{" "}
            <span className="text-accent">Zero config.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted leading-relaxed">
            Push your code — we detect the framework, install dependencies, and
            build automatically.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {FRAMEWORKS.map((fw, i) => (
            <motion.div
              key={fw.name}
              custom={i}
              variants={fadeUp}
              className="group flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-4 py-2.5 text-sm text-muted transition-colors hover:border-accent/30 hover:text-text"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
                {fw.letter}
              </span>
              {fw.name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
