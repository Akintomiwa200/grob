"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { GitBranch, Hammer, Rocket, Globe2, ChevronRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

const STEPS = [
  { 
    icon: GitBranch, 
    label: "Push", 
    desc: "git push to any branch. We automatically detect your framework.",
    color: "from-[#FF5F57] to-[#FF5F57]/50",
    bg: "bg-[#FF5F57]/10",
    text: "text-[#FF5F57]"
  },
  { 
    icon: Hammer, 
    label: "Build", 
    desc: "Lightning fast builds with edge caching and dependency optimization.",
    color: "from-[#FEBC2E] to-[#FEBC2E]/50",
    bg: "bg-[#FEBC2E]/10",
    text: "text-[#FEBC2E]"
  },
  { 
    icon: Rocket, 
    label: "Deploy", 
    desc: "Instantly shipped to 200+ edge locations globally for zero latency.",
    color: "from-accent to-accent/50",
    bg: "bg-accent/10",
    text: "text-accent"
  },
  { 
    icon: Globe2, 
    label: "Live", 
    desc: "Your site is live with auto SSL and custom domains ready.",
    color: "from-[#28C840] to-[#28C840]/50",
    bg: "bg-[#28C840]/10",
    text: "text-[#28C840]"
  },
];

export function Pipeline() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 relative overflow-hidden" ref={ref}>
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
         <div className="w-[800px] h-[300px] bg-accent/20 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-semibold text-accent mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            CI/CD Engine
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-[Space_Grotesk,sans-serif] text-4xl font-bold tracking-tight md:text-5xl text-text mb-4"
          >
            From commit to production <br className="hidden sm:block" /> in seconds.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted max-w-2xl mx-auto"
          >
            Forget about complex DevOps configurations. We handle the entire pipeline seamlessly, so you can focus entirely on writing great code.
          </motion.p>
        </div>

        <div className="relative">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[48px] left-[12%] right-[12%] h-[2px] bg-border z-0">
             <motion.div 
               className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent"
               animate={{ x: ["-100%", "300%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                custom={i}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
                variants={fadeUp}
                className="flex flex-col relative group"
              >
                {/* Connecting arrow for mobile/tablet */}
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden absolute -bottom-6 left-12 flex justify-center w-6">
                    <ChevronRight className="w-5 h-5 text-border rotate-90" />
                  </div>
                )}

                {/* Step Indicator */}
                <div className="flex items-center mb-6">
                  <div className={`relative flex items-center justify-center w-24 h-24 rounded-3xl border border-border bg-[#0B0E14] shadow-xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:border-accent/40 group-hover:shadow-[0_10px_40px_-10px_rgba(110,91,255,0.3)]`}>
                     {/* Glow effect behind icon */}
                     <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${step.color}`} />
                     
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.bg} ${step.text}`}>
                       <step.icon className="w-6 h-6" strokeWidth={2} />
                     </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="font-mono text-sm font-bold text-muted/40 group-hover:text-accent/60 transition-colors">0{i + 1}</span>
                    <h3 className="font-[Space_Grotesk,sans-serif] text-xl font-bold text-text">{step.label}</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
