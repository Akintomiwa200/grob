import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { addCollaborator, removeCollaborator } from "./actions";

export default async function CollaboratorsPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { members: { include: { user: true } }, user: true },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1">Collaborators</h2>
        <p className="text-muted text-sm">Manage team members for this project.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <form action={addCollaborator.bind(null, project.id)} className="flex gap-3">
          <input
            name="email"
            type="email"
            placeholder="colleague@example.com"
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90"
          >
            Add
          </button>
        </form>

        <div className="space-y-3">
          <div className="p-4 border rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {project.user.image ? (
                <img src={project.user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-surface rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium">{project.user.name || "Owner"}</p>
                <p className="text-xs text-muted">{project.user.email}</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 bg-white/[0.05] text-muted rounded">Owner</span>
          </div>

          {project.members.map((m) => (
            <div key={m.id} className="p-4 border rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.user.image ? (
                  <img src={m.user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-surface rounded-full" />
                )}
                <div>
                  <p className="text-sm font-medium">{m.user.name || "Member"}</p>
                  <p className="text-xs text-muted">{m.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-white/[0.05] text-muted rounded capitalize">{m.role}</span>
                <form action={removeCollaborator.bind(null, project.id, m.id)}>
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
