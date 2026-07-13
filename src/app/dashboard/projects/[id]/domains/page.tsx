import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Info,
} from "lucide-react";
import { addDomain, removeDomain, verifyDomain } from "./actions";

export default async function DomainsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { domains: true },
  });
  if (!project) notFound();

  const deploymentUrl = `http://${project.slug}.localhost:3000`;
  const deploymentHost = `${project.slug}.localhost:3000`;
  const prodUrl = `${project.slug}.grob.app`;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Domains</h2>
        <p className="text-muted text-sm">
          Manage custom domains for <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      {/* Primary deployment URL */}
      <div className="bg-surface border border-accent/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-accent uppercase tracking-wide">
            Primary Domain
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-medium text-text">
              {deploymentHost}
            </span>
            <a
              href={deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-500 font-medium">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-500 font-medium">SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add domain form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text mb-3">Add Domain</h3>
        <form action={addDomain.bind(null, project.id)} className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              name="name"
              required
              placeholder="example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm text-text placeholder-muted bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition shrink-0"
          >
            Add Domain
          </button>
        </form>
      </div>

      {/* Domain list */}
      {project.domains.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Globe className="w-7 h-7 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium text-text">No domains yet</h3>
            <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
              Add a custom domain to make your project accessible at your own URL.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {project.domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-muted shrink-0" />
                      <span className="font-mono text-sm font-medium text-text">
                        {domain.name}
                      </span>
                      <a
                        href={`https://${domain.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5">
                      {/* Verification status */}
                      <div className="flex items-center gap-1.5">
                        {domain.verified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-xs text-yellow-500 font-medium">
                              Pending verification
                            </span>
                          </>
                        )}
                      </div>

                      {/* SSL status */}
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-muted" />
                        {domain.sslProvisioned ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">SSL Active</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted">SSL Pending</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!domain.verified && (
                      <form action={verifyDomain.bind(null, project.id, domain.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Verify
                        </button>
                      </form>
                    )}
                    <form action={removeDomain.bind(null, project.id, domain.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove domain"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* DNS instructions for unverified domains */}
                {!domain.verified && (
                  <div className="mt-4 bg-bg border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium text-text">
                        DNS Configuration Required
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted">
                        Add one of the following DNS records at your registrar:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-surface border border-border rounded-lg p-3">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                            Option A — A Record
                          </span>
                          <div className="mt-1.5 font-mono text-xs space-y-0.5">
                            <div>
                              <span className="text-muted">Type</span>{" "}
                              <span className="text-text">A</span>
                            </div>
                            <div>
                              <span className="text-muted">Name</span>{" "}
                              <span className="text-text">@</span>
                            </div>
                            <div>
                              <span className="text-muted">Value</span>{" "}
                              <span className="text-accent">76.76.21.21</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-surface border border-border rounded-lg p-3">
                          <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                            Option B — CNAME Record
                          </span>
                          <div className="mt-1.5 font-mono text-xs space-y-0.5">
                            <div>
                              <span className="text-muted">Type</span>{" "}
                              <span className="text-text">CNAME</span>
                            </div>
                            <div>
                              <span className="text-muted">Name</span>{" "}
                              <span className="text-text">www</span>
                            </div>
                            <div>
                              <span className="text-muted">Value</span>{" "}
                              <span className="text-accent">{project.slug}.grob.app</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted space-y-1">
          <p>
            DNS propagation can take up to 48 hours, though it usually completes within minutes.
          </p>
          <p>
            SSL certificates are automatically provisioned once DNS verification passes.
          </p>
        </div>
      </div>
    </div>
  );
}
