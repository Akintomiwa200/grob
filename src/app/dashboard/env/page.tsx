import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Variable } from "lucide-react";
import { EnvManager } from "./EnvManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Environment Variables | Grob" };

export default async function EnvPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      envVars: { orderBy: { key: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Environment Variables
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage environment variables across all your projects.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <EnvManager
            key={project.id}
            projectId={project.id}
            projectName={project.name}
            initialVars={project.envVars}
          />
        ))}

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface/30 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 ring-1 ring-accent/20">
              <Variable className="w-8 h-8 text-accent" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">No projects yet</h2>
            <p className="text-muted text-sm max-w-md text-center mb-8">
              Create a project first, then add environment variables for different
              deployment environments.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
            >
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
