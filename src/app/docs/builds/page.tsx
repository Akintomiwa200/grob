export default function BuildsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Deploying</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Builds
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Understand how Grob builds your application and how to customize the build process.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Build Commands</h2>
          <p className="text-muted leading-relaxed">By default, Grob runs `npm run build` or `yarn build`. You can override this in your project settings.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Output Directory</h2>
          <p className="text-muted leading-relaxed">Grob will look for a `public`, `build`, or `dist` folder. If your framework uses a different output directory, you can configure it manually.</p>
        </div>
      </div>
    </div>
  );
}
