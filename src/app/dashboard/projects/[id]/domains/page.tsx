import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Globe,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { AddDomainForm } from "./AddDomainForm";
import { removeDomain } from "./actions";

export default async function DomainsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { domains: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Domains</h2>
        <p className="text-muted text-sm">
          Manage custom domains for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      <AddDomainForm projectId={project.id} />

      {project.domains.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Globe className="w-10 h-10 text-muted/40 mx-auto mb-3" />
          <p className="text-sm text-muted mb-1">No domains configured</p>
          <p className="text-xs text-muted/70">
            Add a custom domain above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {project.domains.map((domain) => (
            <div
              key={domain.id}
              className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Globe className="w-4 h-4 text-muted shrink-0" />
                  <code className="text-sm font-mono text-text truncate">
                    {domain.name}
                  </code>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {domain.verified ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-500">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                  <span className="text-border">|</span>
                  {domain.sslProvisioned ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SSL Active
                    </span>
                  ) : domain.sslEnabled ? (
                    <span className="inline-flex items-center gap-1 text-info">
                      <Lock className="w-3.5 h-3.5" />
                      SSL Provisioning
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Unlock className="w-3.5 h-3.5" />
                      No SSL
                    </span>
                  )}
                </div>
              </div>
              <form
                action={removeDomain.bind(null, project.id, domain.id)}
              >
                <button
                  type="submit"
                  title="Remove domain"
                  className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
