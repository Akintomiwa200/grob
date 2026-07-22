"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { Zap, Clock, Globe2, Rocket } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const STATS = [
  { icon: Zap, value: "<10s", label: "Average deploy time" },
  { icon: Clock, value: "0", label: "Downtime per deploy" },
  { icon: Globe2, value: "200+", label: "Edge locations" },
];

const STEPS = [
  { num: "01", title: "Push", desc: "git push to any branch" },
  { num: "02", title: "Build", desc: "Auto-detected & compiled" },
  { num: "03", title: "Deploy", desc: "Shipped to the edge" },
  { num: "04", title: "Live", desc: "Serving globally" },
];

export function DeploymentSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 sm:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[600px] rounded-full bg-accent opacity-[0.05] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent"
          >
            <Rocket className="h-3.5 w-3.5" />
            Deployment Section
          </motion.div>

          <motion.h2
            custom={1}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="font-[Space_Grotesk,sans-serif] text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            From commit to production{" "}
            <span className="text-accent">in seconds.</span>
          </motion.h2>

          <motion.p
            custom={2}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted"
          >
            Forget about complex DevOps configurations. We handle the entire
            pipeline seamlessly, so you can focus entirely on writing great code.
          </motion.p>
        </div>

        {/* Pipeline steps row */}
        <motion.div
          custom={3}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={fadeUp}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative text-center">
              <div className="flex flex-col items-center">
                <span className="font-[Space_Grotesk,sans-serif] text-xs font-bold text-accent/60">
                  {step.num}
                </span>
                <div className="mt-2 h-10 w-10 rounded-full border border-border bg-surface flex items-center justify-center">
                  <span className="font-[Space_Grotesk,sans-serif] text-sm font-bold text-text">
                    {step.title[0]}
                  </span>
                </div>
                <h3 className="mt-3 font-[Space_Grotesk,sans-serif] text-sm font-bold text-text">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-muted">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute left-[calc(50%+28px)] top-[34px] hidden h-px w-[calc(100%-56px)] bg-border sm:block" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={4}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={fadeUp}
          className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-xl border border-border bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-accent/30"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <stat.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <div className="font-[Space_Grotesk,sans-serif] text-3xl font-bold text-text">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
