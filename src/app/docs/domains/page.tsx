export default function DomainsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 text-sm font-medium text-accent">Deploying</div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        Custom Domains
      </h1>
      <p className="mb-10 text-lg text-muted leading-relaxed">
        Assign your own domains to your projects with automatic SSL.
      </p>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">Adding a Domain</h2>
          <p className="text-muted leading-relaxed">Go to your project settings, navigate to Domains, and add your domain name. Grob will provide you with the DNS records to configure.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">SSL Certificates</h2>
          <p className="text-muted leading-relaxed">We automatically provision and renew Let's Encrypt SSL certificates for all custom domains added to your project.</p>
        </div>
      </div>
    </div>
  );
}
