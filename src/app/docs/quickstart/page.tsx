export default function QuickstartPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Getting Started</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Quickstart
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Get your first application deployed in minutes. Follow these simple steps to connect your repository and push to production.
      </p>
      <div className="mt-8 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">1. Connect your repository</h2>
          <p className="text-muted leading-relaxed">Authorize Grob to access your GitHub, GitLab, or Bitbucket account. Select the repository you wish to deploy.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">2. Configure build settings</h2>
          <p className="text-muted leading-relaxed">Grob will automatically detect your framework (Next.js, React, Vue, etc.) and apply the optimal build commands and output directories.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">3. Deploy</h2>
          <p className="text-muted leading-relaxed">Click Deploy. Grob will provision the necessary infrastructure, build your application, and serve it from our global edge network.</p>
        </div>
      </div>
    </div>
  );
}
