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
    <div>
      <Link
        href={`/dashboard/projects/${id}`}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-1 block"
      >
        &larr; {project.name}
      </Link>
      <h1 className="text-2xl font-bold mb-1">Domains</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Manage custom domains for your project.</p>

      <div className="max-w-2xl space-y-6">
        <form action={addDomain.bind(null, project.id)} className="flex gap-3">
          <input
            name="name"
            placeholder="example.com"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 bg-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200"
          >
            Add Domain
          </button>
        </form>

        {project.domains.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No domains added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.domains.map((domain) => (
              <div key={domain.id} className="p-4 border rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium">{domain.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                        <button type="submit" className="text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
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
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                    <p className="font-medium mb-1">DNS Configuration:</p>
                    <p className="font-mono text-gray-500">Add a CNAME record pointing <span className="text-gray-900 dark:text-gray-200">{domain.name}</span> to <span className="text-gray-900 dark:text-gray-200">{project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.grob.app</span></p>
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
