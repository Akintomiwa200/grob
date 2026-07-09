import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { addDomain, removeDomain, verifyDomain } from "./actions";

export default async function DomainsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { domains: true },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">Domains</h2>
        <p className="text-muted text-sm">Manage custom domains for your project.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <form action={addDomain.bind(null, project.id)} className="flex gap-3">
          <input
            name="name"
            placeholder="example.com"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
          >
            Add Domain
          </button>
        </form>

        {project.domains.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted text-sm">No domains added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.domains.map((domain) => (
              <div key={domain.id} className="p-4 border rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium">{domain.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className={`flex items-center gap-1 ${domain.verified ? "text-green-600 dark:text-green-400" : ""}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${domain.verified ? "bg-green-500" : "bg-yellow-400"}`} />
                        {domain.verified ? "Verified" : "Pending verification"}
                      </span>
                      <span className={`flex items-center gap-1 ${domain.sslEnabled ? "text-green-600 dark:text-green-400" : ""}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${domain.sslProvisioned ? "bg-green-500" : "bg-gray-400"}`} />
                        SSL {domain.sslProvisioned ? "Active" : "Not provisioned"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!domain.verified && (
                      <form action={verifyDomain.bind(null, project.id, domain.id)}>
                        <button type="submit" className="text-xs px-3 py-1.5 border rounded-lg hover:bg-white/[0.05]">
                          Verify
                        </button>
                      </form>
                    )}
                    <form action={removeDomain.bind(null, project.id, domain.id)}>
                      <button type="submit" className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
                {!domain.verified && (
                  <div className="mt-3 p-3 bg-surface rounded-lg text-xs">
                    <p className="font-medium mb-1">DNS Configuration:</p>
                    <p className="font-mono text-muted">Add a CNAME record pointing <span className="text-text">{domain.name}</span> to <span className="text-text">{project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.grob.app</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
