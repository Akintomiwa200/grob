import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Variable } from "lucide-react";
import { EnvVarsManager } from "./EnvVarsManager";

export default async function EnvPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { envVars: { orderBy: { key: "asc" } } },
  });
  if (!project) notFound();

  const envVars = project.envVars.map((v) => ({
    id: v.id,
    key: v.key,
    value: v.value,
    buildTime: v.buildTime,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">
          Environment Variables
        </h2>
        <p className="text-muted text-sm">
          Manage environment variables for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Variable className="w-4 h-4 text-muted" />
          <h3 className="text-sm font-semibold text-text">Variables</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Injected at build time and runtime. A new deployment is required for
          changes to take effect.
        </p>

        <EnvVarsManager projectId={project.id} initialVars={envVars} />
      </div>
    </div>
  );
}
