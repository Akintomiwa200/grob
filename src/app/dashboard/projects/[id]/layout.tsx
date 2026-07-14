import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { deployProject } from "./actions";

export default async function ProjectLayout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) notFound();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-6 text-text">
      {/* Persistent Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted">
            {project.gitUrl ? (
              <a
                href={project.gitUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-text transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {project.gitUrl.replace("https://github.com/", "")}
              </a>
            ) : (
              <span>No connected repository</span>
            )}
            <span>&bull;</span>
            <span className="font-mono bg-surface px-1.5 py-0.5 rounded-md text-xs">
              {project.framework || "Custom"}
            </span>
          </div>
          {project.description && (
            <p className="text-muted text-sm mt-3 max-w-2xl">{project.description}</p>
          )}
        </div>
        <form action={deployProject.bind(null, project.id)}>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Deploy
          </button>
        </form>
      </div>

      {/* Active Tab Content */}
      <div>{props.children}</div>
    </div>
  );
}
