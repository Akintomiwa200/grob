import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe2, Plus, Search, MoreHorizontal, ExternalLink, ShieldCheck, AlertCircle, Clock, Trash2 } from "lucide-react";

export default async function DomainsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const domains = await prisma.domain.findMany({
    where: {
      project: { userId: session.user.id },
    },
    include: { project: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Domains</h1>
          <p className="text-muted text-sm mt-1">Manage your custom domains and SSL certificates.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Add Domain
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search domains..."
            className="w-full rounded-xl border border-border bg-surface/30 pl-10 pr-4 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface/50 text-muted">
            <tr>
              <th className="px-6 py-4 font-medium">Domain</th>
              <th className="px-6 py-4 font-medium hidden md:table-cell">Project</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">SSL</th>
              <th className="px-6 py-4 font-medium hidden sm:table-cell">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {domains.map((domain) => (
              <tr key={domain.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-border">
                      <Globe2 className="h-4 w-4 text-text" />
                    </div>
                    <div>
                      <span className="font-semibold text-text flex items-center gap-1.5">
                        {domain.name}
                        <ExternalLink className="h-3 w-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <Link href={`/dashboard/projects/${domain.project.id}`} className="text-muted hover:text-text transition-colors">
                    {domain.project.name}
                  </Link>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className={`flex items-center gap-1.5 ${domain.sslEnabled ? "text-emerald-500" : "text-muted"}`}>
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">{domain.sslProvisioned ? "SSL Active" : domain.sslEnabled ? "Provisioning" : "No SSL"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className={`flex items-center gap-1.5 ${domain.verified ? "text-emerald-500" : "text-amber-500"}`}>
                    {domain.verified ? <ShieldCheck className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    <span className="text-xs font-medium">{domain.verified ? "Verified" : "Pending"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {domains.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <Globe2 className="h-6 w-6 text-accent" />
                    </div>
                    <p className="text-muted text-sm">No domains yet. Add your first domain to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-text mb-2">Need help configuring DNS?</h3>
          <p className="text-sm text-muted max-w-2xl mb-4">
            Setting up a custom domain requires adding A records or CNAME records to your domain registrar&apos;s DNS settings. It can take up to 48 hours for changes to propagate globally.
          </p>
          <a href="#" className="inline-flex items-center text-sm font-medium text-accent hover:text-accent/80 transition-colors">
            Read the DNS Configuration Guide &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
