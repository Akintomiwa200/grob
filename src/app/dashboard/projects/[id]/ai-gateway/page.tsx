import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProjectAiGatewayClient } from "./ProjectAiGatewayClient";

export default async function AiGatewayPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const [routes, keys, totalRequests, avgLatencyResult] = await Promise.all([
    prisma.aiGatewayRoute.findMany({
      where: { projectId: id },
      include: { _count: { select: { logs: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiGatewayKey.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiGatewayLog.count({ where: { projectId: id } }),
    prisma.aiGatewayLog.aggregate({
      where: { projectId: id },
      _avg: { latencyMs: true },
    }),
  ]);

  const stats = {
    totalRequests,
    avgLatency: avgLatencyResult._avg.latencyMs
      ? Math.round(avgLatencyResult._avg.latencyMs)
      : 0,
    errorRate: 0,
  };

  return (
    <ProjectAiGatewayClient
      projectId={id}
      routes={routes}
      keys={keys.map((k) => ({
        ...k,
        createdAt: k.createdAt.toISOString(),
        lastUsed: k.lastUsed?.toISOString() ?? null,
      }))}
      stats={stats}
    />
  );
}
