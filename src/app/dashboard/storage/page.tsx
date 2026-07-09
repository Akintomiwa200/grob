import { Database } from "lucide-react";
import Link from "next/link";

export default function StoragePage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Storage</h1>
        <p className="text-muted text-sm mt-2">Manage databases, blob storage, and KV stores.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface/30 rounded-2xl shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 ring-1 ring-accent/20">
          <Database className="w-8 h-8 text-accent" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">Storage is coming soon</h2>
        <p className="text-muted text-sm max-w-md text-center mb-8">
          We are currently building this feature. Check back later or read the documentation to learn more about our roadmap.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm">
            Back to Dashboard
          </Link>
          <a href="#" className="px-5 py-2.5 text-sm font-medium text-text bg-surface border border-border rounded-lg hover:bg-white/[0.05] transition-colors">
            Read Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
