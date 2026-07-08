import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { addRedirect, deleteRedirect } from "./actions";

export default async function RedirectsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { redirects: true },
  });
  if (!project) notFound();

  return (
    <div>
      <Link
        href={`/dashboard/projects/${id}`}
        className="text-sm text-muted hover:text-text mb-1 block"
      >
        &larr; {project.name}
      </Link>
      <h1 className="text-2xl font-bold mb-1">Redirects</h1>
      <p className="text-muted text-sm mb-8">Manage URL redirects and rewrites.</p>

      <div className="max-w-2xl space-y-6">
        <form action={addRedirect.bind(null, project.id)} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Source</label>
            <input
              name="source"
              placeholder="/old-path"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Destination</label>
            <input
              name="destination"
              placeholder="/new-path"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Type</label>
            <select
              name="type"
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
            >
              <option value="permanent">301</option>
              <option value="redirect">302</option>
              <option value="rewrite">Rewrite</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
          >
            Add
          </button>
        </form>

        {project.redirects.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted text-sm">No redirects configured.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.redirects.map((r) => (
              <div key={r.id} className="p-4 border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-0.5 bg-white/[0.05] text-muted rounded font-mono uppercase">
                    {r.type === "permanent" ? "301" : r.type === "redirect" ? "302" : "Rewrite"}
                  </span>
                  <div>
                    <p className="font-mono text-sm">{r.source}</p>
                    <p className="font-mono text-xs text-muted">&rarr; {r.destination}</p>
                  </div>
                </div>
                <form action={deleteRedirect.bind(null, project.id, r.id)}>
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
