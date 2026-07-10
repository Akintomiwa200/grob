export default function EnvVarsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Deploying</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Environment Variables
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Securely manage secrets and configuration for your deployments.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Adding Variables</h2>
          <p className="text-muted leading-relaxed">You can add environment variables via the dashboard. These are encrypted at rest and injected at build and runtime.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Environments</h2>
          <p className="text-muted leading-relaxed">Variables can be scoped to specific environments: Production, Preview, or Development.</p>
        </div>
      </div>
    </div>
  );
}
