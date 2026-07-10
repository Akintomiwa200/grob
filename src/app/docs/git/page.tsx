export default function GitIntegrationPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Deploying</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Git Integration
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Connect your Git repositories for automatic deployments on every push.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Production Branch</h2>
          <p className="text-muted leading-relaxed">Pushes to your default branch (usually `main` or `master`) will automatically trigger a production deployment.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Preview Deployments</h2>
          <p className="text-muted leading-relaxed">Every pull request or push to a non-production branch generates a unique preview URL, allowing your team to test changes before merging.</p>
        </div>
      </div>
    </div>
  );
}
