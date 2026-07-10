import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { BarChart2, Terminal, FolderTree, Activity, Globe, CheckCircle2, ChevronRight, Check } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function PowerfulFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.h2
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="mb-4 font-[Space_Grotesk,sans-serif] text-3xl font-bold tracking-tight md:text-5xl text-text"
          >
            Powerful Features
          </motion.h2>
          <motion.p
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            custom={1}
            className="text-lg text-muted"
          >
            Discover the tools that make our platform stand out from the competition
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Performance Metrics */}
          <motion.div
            custom={2}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-8 flex flex-col rounded-3xl border border-border bg-surface overflow-hidden relative group"
          >
            <div className="p-6 pb-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border/50">
                <BarChart2 className="h-5 w-5 text-text" />
              </div>
              <span className="font-semibold text-text">Performance Metrics</span>
            </div>
            
            {/* Inner Dashboard Mockup */}
            <div className="p-6 mt-4 flex-1">
              <div className="rounded-xl border border-border bg-[#0B0E14] h-full overflow-hidden flex flex-col relative p-4 lg:p-6 gap-6">
                
                {/* Header of inner mockup */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center"><span className="text-accent text-[10px] font-bold">G</span></div>
                     <span className="text-xs font-semibold text-text">Grob</span>
                   </div>
                   <div className="hidden md:flex items-center gap-6 text-[11px] text-muted">
                     <span>Features</span>
                     <span>Contact</span>
                     <span>Pricing</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-xs text-muted">A</span>
                     <span className="text-xs text-muted">B</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                  {/* Left Side: Hero Text */}
                  <div>
                    <h3 className="text-2xl font-bold leading-tight text-text mb-3">
                      Build and launch<br/>in minutes, not days.
                    </h3>
                    <p className="text-[11px] text-muted mb-4 max-w-xs leading-relaxed">
                      Our platform accelerates development with powerful tools that let you build and deploy professional websites with unprecedented speed.
                    </p>
                    <div className="flex gap-2">
                      <div className="px-3 py-1.5 rounded bg-text text-bg text-[10px] font-semibold">Get Started</div>
                      <div className="px-3 py-1.5 rounded border border-border text-text text-[10px] font-semibold">Learn More</div>
                    </div>

                    <div className="mt-8 rounded-lg border border-border bg-surface p-3">
                       <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                          <span className="text-[10px] font-semibold text-text">Recent Deployments</span>
                          <span className="text-[10px] text-muted">View all</span>
                       </div>
                       <div className="space-y-2">
                          {[1,2,3].map(i => (
                             <div key={i} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center">
                                     <Check className="w-2.5 h-2.5 text-success" />
                                  </div>
                                  <span className="text-muted">production</span>
                                </div>
                                <span className="text-muted">2m ago</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  {/* Right Side: Metrics */}
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-4 gap-2 text-center">
                       {['Performance', 'Accessibility', 'Best Practices', 'SEO'].map((lbl, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 rounded-full border-[3px] border-success flex items-center justify-center relative">
                                <span className="text-sm font-bold text-success">100</span>
                             </div>
                             <span className="text-[9px] text-muted">{lbl}</span>
                          </div>
                       ))}
                    </div>

                    <div>
                      <h4 className="text-[10px] font-semibold text-text mb-3 uppercase tracking-wider">Performance Metrics</h4>
                      <div className="space-y-2.5">
                        <MetricRow label="First Contentful Paint" value="0.8s" status="Fast" />
                        <MetricRow label="Largest Contentful Paint" value="1.2s" status="Fast" />
                        <MetricRow label="Total Blocking Time" value="0ms" status="Fast" />
                        <MetricRow label="Cumulative Layout Shift" value="0" status="Good" />
                        <MetricRow label="Speed Index" value="1.4s" status="Fast" />
                      </div>
                    </div>
                    
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-border">
                       <span className="text-[10px] text-muted">Analysis Complete</span>
                       <span className="text-[10px] text-muted">7/10/2026</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* 2. One-Click Deployment */}
          <motion.div
            custom={3}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-4 flex flex-col rounded-3xl border border-border bg-surface overflow-hidden relative group"
          >
            <div className="p-6 pb-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border/50">
                <Terminal className="h-5 w-5 text-text" />
              </div>
              <span className="font-semibold text-text">One-Click Deployment</span>
            </div>

            <div className="p-6 mt-4 flex-1 flex flex-col gap-6">
               <div className="rounded-xl border border-border bg-[#0B0E14] overflow-hidden">
                 <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5 bg-surface/50">
                    <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                    <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                    <span className="h-2 w-2 rounded-full bg-[#28C840]" />
                    <span className="ml-2 font-mono text-[10px] text-muted">terminal</span>
                 </div>
                 <div className="p-4 font-mono text-xs leading-relaxed">
                   <div className="text-text"><span className="text-accent">{">"}</span> npm run build --production</div>
                   <div className="text-muted mt-1">{"->"} Bundling assets...</div>
                   <div className="text-success">{"->"} Optimizing code...</div>
                   <div className="mt-2 w-2 h-3 bg-accent animate-pulse" />
                 </div>
               </div>

               <div className="mt-auto">
                 <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 z-0" />
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-bg">
                         <Check className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] text-muted">Prepare</span>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text text-xs">
                         2
                       </div>
                       <span className="text-[10px] text-muted">Build</span>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text text-xs">
                         3
                       </div>
                       <span className="text-[10px] text-muted">Deploy</span>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text text-xs text-muted">
                         4
                       </div>
                       <span className="text-[10px] text-muted">Live</span>
                    </div>
                 </div>
                 <div className="mt-8 text-[10px] text-muted/50">CI/CD Pipeline</div>
               </div>
            </div>
          </motion.div>

          {/* 3. File Structure */}
          <motion.div
            custom={4}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-3 flex flex-col rounded-3xl border border-border bg-surface overflow-hidden relative group"
          >
            <div className="p-6 pb-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border/50">
                <FolderTree className="h-5 w-5 text-text" />
              </div>
              <span className="font-semibold text-text">File Structure</span>
            </div>

            <div className="p-6 mt-4 flex-1 flex flex-col">
               <div className="rounded-xl border border-border bg-[#0B0E14] overflow-hidden flex-1 flex flex-col p-4">
                 <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                   <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#FF5F57]/50" />
                      <span className="h-2 w-2 rounded-full bg-[#FEBC2E]/50" />
                      <span className="h-2 w-2 rounded-full bg-[#28C840]/50" />
                   </div>
                   <span className="text-[10px] text-muted">Explorer</span>
                   <span className="text-[10px] text-muted">my-project</span>
                 </div>
                 
                 <div className="font-mono text-xs space-y-1.5 text-muted">
                   <div className="flex items-center gap-1.5 text-text">
                     <ChevronRight className="w-3 h-3" /> <FolderTree className="w-3 h-3 text-accent" /> src
                   </div>
                   <div className="pl-4 space-y-1.5">
                     <div className="flex items-center gap-1.5">
                       <ChevronRight className="w-3 h-3" /> <FolderTree className="w-3 h-3" /> components
                     </div>
                     <div className="flex items-center gap-1.5">
                       <ChevronRight className="w-3 h-3" /> <FolderTree className="w-3 h-3" /> common
                     </div>
                     <div className="flex items-center gap-1.5">
                       <ChevronRight className="w-3 h-3" /> <FolderTree className="w-3 h-3" /> pages
                     </div>
                     <div className="flex items-center gap-1.5">
                       <ChevronRight className="w-3 h-3 opacity-0" /> <FolderTree className="w-3 h-3" /> lib
                     </div>
                     <div className="flex items-center gap-1.5 text-text">
                       <ChevronRight className="w-3 h-3 rotate-90" /> <FolderTree className="w-3 h-3 text-accent" /> app
                     </div>
                     <div className="pl-4 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">+</span> layout.tsx
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">+</span> page.tsx
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted">...</span> about
                        </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="mt-4 flex items-center justify-between">
                  <span className="text-[9px] text-muted">Modular Architecture</span>
                  <span className="text-[9px] text-muted">Organized & Scalable</span>
               </div>
            </div>
          </motion.div>

          {/* 4. Scalable Environments */}
          <motion.div
            custom={5}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-3 flex flex-col rounded-3xl border border-border bg-surface overflow-hidden relative group"
          >
            <div className="p-6 pb-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border/50">
                <Activity className="h-5 w-5 text-text" />
              </div>
              <span className="font-semibold text-text">Scalable Environments</span>
            </div>

            <div className="p-6 mt-4 flex-1 flex flex-col">
               <div className="flex-1 flex flex-col gap-4">
                 
                 <div className="rounded-xl border border-border bg-[#0B0E14] p-4">
                   <span className="text-[10px] text-muted mb-2 block">Resource Usage (24h)</span>
                   <div className="h-20 w-full relative border-b border-l border-border/50">
                      {/* Fake Area Chart */}
                      <svg className="w-full h-full text-accent" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,80 Q10,75 20,80 T40,40 T60,30 T80,45 T100,60 L100,100 L0,100 Z" fill="currentColor" fillOpacity="0.2" />
                        <path d="M0,80 Q10,75 20,80 T40,40 T60,30 T80,45 T100,60" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      
                      <div className="absolute top-0 -left-6 h-full flex flex-col justify-between text-[8px] text-muted py-1">
                        <span>100</span><span>50</span><span>25</span><span>0</span>
                      </div>
                      <div className="absolute -bottom-5 left-0 w-full flex justify-between text-[8px] text-muted px-1">
                        <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
                      </div>
                   </div>
                 </div>

                 <div className="rounded-xl border border-border bg-[#0B0E14] p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] text-muted">Active Servers</span>
                       <span className="text-sm font-bold text-text">3</span>
                    </div>
                    <div className="flex gap-2">
                       {[
                         { id: 1, height: "35%" },
                         { id: 2, height: "55%" },
                         { id: 3, height: "25%" }
                       ].map(bar => (
                         <div key={bar.id} className="flex-1 h-8 rounded border border-border bg-surface/50 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-full bg-accent/40" style={{height: bar.height}} />
                         </div>
                       ))}
                    </div>
                 </div>

               </div>
               
               <div className="mt-4 flex items-center justify-between">
                  <span className="text-[9px] text-muted">Auto-scaling Platform</span>
                  <span className="text-[9px] text-muted">Handles Any Load</span>
               </div>
            </div>
          </motion.div>

          {/* 5. Global Deployments */}
          <motion.div
            custom={6}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            variants={fadeUp}
            className="lg:col-span-6 flex flex-col rounded-3xl border border-border bg-surface overflow-hidden relative group"
          >
            <div className="p-6 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-border/50">
                  <Globe className="h-5 w-5 text-text" />
                </div>
                <span className="font-semibold text-text">Global Deployments</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-[#0B0E14] text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-muted">Live Status</span>
              </div>
            </div>

            <div className="p-6 mt-4 flex-1 flex flex-col relative min-h-[240px]">
               {/* Globe Visualization Mock */}
               <div className="absolute inset-0 flex items-end justify-center overflow-hidden pb-4">
                 <div className="w-[180%] sm:w-[120%] lg:w-[90%] aspect-square rounded-full border border-border/30 bg-[#0B0E14] relative translate-y-[30%]">
                    {/* Dotted map representation */}
                    <svg className="w-full h-full text-muted/20" fill="currentColor" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 3" />
                       <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 4" />
                       <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 3" />
                       
                       {/* Active Regions */}
                       <circle cx="30" cy="35" r="1.5" className="text-accent" />
                       <circle cx="28" cy="35" r="3" className="text-accent/30 animate-ping" />
                       
                       <circle cx="65" cy="40" r="1.5" className="text-accent" />
                       <circle cx="65" cy="40" r="3" className="text-accent/30 animate-ping" />
                       
                       <circle cx="80" cy="60" r="1.5" className="text-accent" />
                       <circle cx="80" cy="60" r="3" className="text-accent/30 animate-ping" />
                       
                       <circle cx="45" cy="20" r="1.5" className="text-accent" />
                       <circle cx="45" cy="20" r="3" className="text-accent/30 animate-ping" />
                    </svg>
                 </div>
               </div>

               <div className="relative z-10 mt-auto flex items-end justify-between">
                 <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold text-text">1094</span>
                      <span className="text-[10px] text-muted">deployments</span>
                    </div>
                    <div className="w-px h-8 bg-border mt-1" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold text-text">99.8%</span>
                      <span className="text-[10px] text-muted">uptime</span>
                    </div>
                    <div className="w-px h-8 bg-border mt-1" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold text-text">8</span>
                      <span className="text-[10px] text-muted">regions</span>
                    </div>
                 </div>
                 
                 <div className="text-[9px] text-muted/50 hidden sm:block">
                   Global Network
                 </div>
               </div>
               
               <div className="absolute bottom-6 right-6 text-[9px] text-muted/50">
                  200+ Edge Locations
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function MetricRow({ label, value, status }: { label: string, value: string, status: string }) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-muted/50" />
        <span className="text-muted">{label}</span>
      </div>
      <div className="flex items-center gap-3">
         <span className="text-text font-medium">{value}</span>
         <span className={`w-8 text-center rounded text-[9px] font-semibold py-0.5 ${status === 'Fast' || status === 'Good' ? 'bg-success/10 text-success' : 'bg-signal/10 text-signal'}`}>
           {status}
         </span>
      </div>
    </div>
  )
}
