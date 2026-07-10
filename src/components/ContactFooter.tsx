import { motion } from "framer-motion";

export function ContactFooter() {
  return (
    <div className="relative overflow-hidden bg-bg text-text pt-32 pb-12 font-[Inter,sans-serif]">
      {/* Background Map / Dots */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
         <div 
           className="w-full h-[600px] absolute top-10"
           style={{
             backgroundImage: 'radial-gradient(circle at center, rgba(110, 91, 255, 0.1) 0%, transparent 60%), radial-gradient(rgba(231, 233, 238, 0.3) 1px, transparent 1px)',
             backgroundSize: '100% 100%, 16px 16px',
             backgroundPosition: 'center center, center center',
             maskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, black 20%, transparent 70%)',
             WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, black 20%, transparent 70%)'
           }}
         />
         {/* Scattered glowing points */}
         <div className="absolute top-[30%] left-[30%] w-2 h-2 rounded-full bg-text shadow-[0_0_15px_3px_rgba(231,233,238,0.5)] animate-pulse" />
         <div className="absolute top-[40%] right-[35%] w-1.5 h-1.5 rounded-full bg-text shadow-[0_0_15px_3px_rgba(231,233,238,0.5)] animate-[pulse_3s_infinite_1s]" />
         <div className="absolute top-[50%] left-[45%] w-1.5 h-1.5 rounded-full bg-text shadow-[0_0_15px_3px_rgba(231,233,238,0.5)] animate-[pulse_4s_infinite_2s]" />
         <div className="absolute top-[20%] right-[25%] w-2 h-2 rounded-full bg-text shadow-[0_0_15px_3px_rgba(231,233,238,0.5)] animate-[pulse_3.5s_infinite_0.5s]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-[Space_Grotesk,sans-serif] text-4xl md:text-5xl font-bold mb-4">
            Global User Community
          </h2>
          <p className="text-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers worldwide who trust Grob for their projects. Our templates are being used across the globe to create stunning web experiences.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="w-full max-w-xl rounded-2xl border border-border bg-surface/50 backdrop-blur-xl p-8 shadow-2xl mb-24">
          <h3 className="font-[Space_Grotesk,sans-serif] text-xl font-bold mb-8">
            Global User Community
          </h3>

          <form className="space-y-6 flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold tracking-wider text-muted uppercase">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full rounded-xl border border-border bg-[#0B0E14] px-4 py-3 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold tracking-wider text-muted uppercase">Email Address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="w-full rounded-xl border border-border bg-[#0B0E14] px-4 py-3 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold tracking-wider text-muted uppercase">Your Message</label>
              <textarea 
                placeholder="How can we help you?" 
                rows={4}
                className="w-full rounded-xl border border-border bg-[#0B0E14] px-4 py-3 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none"
              />
            </div>

            <button type="submit" className="w-full rounded-full bg-text text-bg font-semibold py-3 text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Continue
            </button>
          </form>
        </div>

        {/* Giant Outlined Text */}
        <div className="w-full overflow-hidden flex justify-center mb-16 pointer-events-none select-none">
          <span 
            className="font-[Space_Grotesk,sans-serif] font-bold text-[12vw] sm:text-[140px] leading-none tracking-tighter"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(33, 38, 51, 0.8)', // border-border color with higher opacity
            }}
          >
            Grob
          </span>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-xs text-muted/60">
          © {new Date().getFullYear()} Grob Templates. All rights reserved.
        </div>
      </div>
    </div>
  );
}
