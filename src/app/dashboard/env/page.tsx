import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Variable, Plus, Eye, EyeOff, Trash2 } from "lucide-react";

export default async function EnvPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      envVars: { orderBy: { key: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Environment Variables</h1>
          <p className="text-muted text-sm mt-1">Manage global and per-project environment variables.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Add Variable
        </button>
      </div>

      <div className="space-y-8">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl border border-border bg-surface/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface/30">
              <Link href={`/dashboard/projects/${project.id}`} className="font-semibold text-text hover:text-accent transition-colors">
                {project.name}
              </Link>
              <span className="text-muted text-xs ml-2">{project.envVars.length} variables</span>
            </div>
            {project.envVars.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium">Key</th>
                    <th className="px-6 py-3 font-medium">Value</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Build Time</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {project.envVars.map((env) => (
                    <tr key={env.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm text-text">{env.key}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm text-muted flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          {env.value.slice(0, 3)}••••••••
                        </span>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-medium ${env.buildTime ? "text-emerald-500" : "text-muted"}`}>
                          {env.buildTime ? "Included" : "Excluded"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Variable className="h-5 w-5 text-muted" />
                  <p className="text-sm text-muted">No environment variables for this project.</p>
                </div>
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface/30 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 ring-1 ring-accent/20">
              <Variable className="w-8 h-8 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">No projects yet</h2>
            <p className="text-muted text-sm max-w-md text-center mb-8">
              Create a project first, then add environment variables for different deployment environments.
            </p>
            <Link href="/dashboard/projects/new" className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
