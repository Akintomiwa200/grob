export default function CachingPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Edge Network</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Caching
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Leverage our edge network for optimal performance.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Static Assets</h2>
          <p className="text-muted leading-relaxed">Images, CSS, and JavaScript files are cached indefinitely at the edge. Cache is automatically invalidated upon a new deployment.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Dynamic Content</h2>
          <p className="text-muted leading-relaxed">Use standard HTTP Cache-Control headers in your API routes to control edge caching behavior for dynamic content.</p>
        </div>
      </div>
    </div>
  );
}
