export default function FrameworksPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Getting Started</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Frameworks
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Grob supports a wide range of frontend frameworks out of the box, with zero-configuration deployments.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Next.js</h2>
          <p className="text-muted leading-relaxed">First-class support for Next.js, including Server-Side Rendering (SSR), Static Site Generation (SSG), and API Routes.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">React (Vite/Create React App)</h2>
          <p className="text-muted leading-relaxed">Deploy single-page applications (SPAs) built with React effortlessly. Routing is automatically configured.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Vue & Nuxt</h2>
          <p className="text-muted leading-relaxed">Full support for Vue 3 and Nuxt 3 deployments, optimized for the edge.</p>
        </div>
      </div>
    </div>
  );
}
