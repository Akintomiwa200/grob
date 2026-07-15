"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function listAiRoutes(projectId: string) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.aiGatewayRoute.findMany({
    where: { projectId },
    include: { _count: { select: { logs: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAiRoute(routeId: string) {
  const userId = await requireUser();
  return prisma.aiGatewayRoute.findFirst({
    where: { id: routeId, project: { userId } },
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { logs: true } },
    },
  });
}

export async function createAiRoute(
  projectId: string,
  data: {
    name: string;
    path: string;
    model: string;
    provider: string;
    rateLimit?: number;
    cacheTtl?: number;
  }
) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  const route = await prisma.aiGatewayRoute.create({
    data: {
      projectId,
      name: data.name,
      path: data.path.startsWith("/") ? data.path : `/${data.path}`,
      model: data.model,
      provider: data.provider,
      rateLimit: data.rateLimit ?? 1000,
      cacheTtl: data.cacheTtl ?? 0,
    },
  });

  revalidatePath("/dashboard/ai-gateway");
  revalidatePath(`/dashboard/projects/${projectId}/ai-gateway`);
  return route;
}

export async function updateAiRoute(
  routeId: string,
  data: Partial<{
    name: string;
    path: string;
    model: string;
    provider: string;
    rateLimit: number;
    enabled: boolean;
    cacheTtl: number;
  }>
) {
  const userId = await requireUser();
  const route = await prisma.aiGatewayRoute.findFirst({
    where: { id: routeId, project: { userId } },
  });
  if (!route) throw new Error("Route not found");

  const updated = await prisma.aiGatewayRoute.update({
    where: { id: routeId },
    data,
  });

  revalidatePath("/dashboard/ai-gateway");
  revalidatePath(`/dashboard/ai-gateway/${routeId}`);
  revalidatePath(`/dashboard/projects/${route.projectId}/ai-gateway`);
  return updated;
}

export async function deleteAiRoute(routeId: string) {
  const userId = await requireUser();
  const route = await prisma.aiGatewayRoute.findFirst({
    where: { id: routeId, project: { userId } },
  });
  if (!route) throw new Error("Route not found");

  await prisma.aiGatewayRoute.delete({ where: { id: routeId } });
  revalidatePath("/dashboard/ai-gateway");
  revalidatePath(`/dashboard/projects/${route.projectId}/ai-gateway`);
}

export async function listAiKeys(projectId: string) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.aiGatewayKey.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAiKey(projectId: string, name: string) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  const key = `sk-grob-${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const apiKey = await prisma.aiGatewayKey.create({
    data: { projectId, name, key },
  });

  revalidatePath("/dashboard/ai-gateway");
  revalidatePath(`/dashboard/projects/${projectId}/ai-gateway`);
  return apiKey;
}

export async function deleteAiKey(keyId: string) {
  const userId = await requireUser();
  const key = await prisma.aiGatewayKey.findFirst({
    where: { id: keyId, project: { userId } },
  });
  if (!key) throw new Error("Key not found");

  await prisma.aiGatewayKey.delete({ where: { id: keyId } });
  revalidatePath("/dashboard/ai-gateway");
  revalidatePath(`/dashboard/projects/${key.projectId}/ai-gateway`);
}

export async function getAiGatewayStats(projectId: string) {
  const userId = await requireUser();
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found");

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);

  const [totalRequests24h, routeCount, logsWithLatency] = await Promise.all([
    prisma.aiGatewayLog.count({
      where: { projectId, createdAt: { gte: dayAgo } },
    }),
    prisma.aiGatewayRoute.count({ where: { projectId } }),
    prisma.aiGatewayLog.findMany({
      where: { projectId, createdAt: { gte: dayAgo } },
      select: { latencyMs: true },
    }),
  ]);

  const avgLatency =
    logsWithLatency.length > 0
      ? Math.round(
          logsWithLatency.reduce((sum, l) => sum + l.latencyMs, 0) /
            logsWithLatency.length
        )
      : 0;

  return { totalRequests24h, avgLatency, routeCount };
}

export async function getAllAiGatewayStats(userId: string) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [totalRequests24h, routeCount, logsWithLatency, keyCount, recentLogs] =
    await Promise.all([
      prisma.aiGatewayLog.count({
        where: { project: { userId }, createdAt: { gte: dayAgo } },
      }),
      prisma.aiGatewayRoute.count({
        where: { project: { userId } },
      }),
      prisma.aiGatewayLog.findMany({
        where: { project: { userId }, createdAt: { gte: dayAgo } },
        select: { latencyMs: true },
      }),
      prisma.aiGatewayKey.count({
        where: { project: { userId } },
      }),
      prisma.aiGatewayLog.findMany({
        where: { project: { userId }, createdAt: { gte: thirtyDaysAgo } },
        select: { model: true, provider: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const avgLatency =
    logsWithLatency.length > 0
      ? Math.round(
          logsWithLatency.reduce((sum, l) => sum + l.latencyMs, 0) /
            logsWithLatency.length
        )
      : 0;

  const byModel: Record<string, number> = {};
  const byProvider: Record<string, number> = {};
  for (const log of recentLogs) {
    byModel[log.model] = (byModel[log.model] || 0) + 1;
    byProvider[log.provider] = (byProvider[log.provider] || 0) + 1;
  }

  return {
    totalRequests24h,
    avgLatency,
    routeCount,
    keyCount,
    byModel,
    byProvider,
  };
}
