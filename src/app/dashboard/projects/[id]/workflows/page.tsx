import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProjectWorkflowsClient } from "./ProjectWorkflowsClient";

export default async function WorkflowsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const workflows = await prisma.workflow.findMany({
    where: { projectId: id },
    include: {
      _count: { select: { runs: true } },
      runs: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true, status: true, startedAt: true, duration: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProjectWorkflowsClient
      projectId={id}
      workflows={workflows.map((w) => ({
        ...w,
        runs: w.runs.map((r) => ({ ...r, startedAt: r.startedAt.toISOString() })),
      }))}
    />
  );
}
