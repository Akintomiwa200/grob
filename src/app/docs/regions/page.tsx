export default function RegionsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Edge Network</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Regions
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Serve your application globally, closer to your users.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Edge CDN</h2>
          <p className="text-muted leading-relaxed">Static assets are automatically cached and served from all our global edge nodes, ensuring blazing-fast load times.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Serverless Functions</h2>
          <p className="text-muted leading-relaxed">You can choose specific regions to execute your serverless functions (API routes) to reduce latency to your database.</p>
        </div>
      </div>
    </div>
  );
}
