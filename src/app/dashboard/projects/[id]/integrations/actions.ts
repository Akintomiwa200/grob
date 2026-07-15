"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const AVAILABLE_SERVICES = [
  { id: "slack", name: "Slack", description: "Get deployment notifications and alerts in Slack channels" },
  { id: "github", name: "GitHub", description: "Sync repositories and manage deployments from GitHub" },
  { id: "gitlab", name: "GitLab", description: "Connect GitLab repositories for CI/CD pipelines" },
  { id: "discord", name: "Discord", description: "Receive real-time deployment updates in Discord servers" },
  { id: "teams", name: "Microsoft Teams", description: "Collaborate on deployments with Teams notifications" },
  { id: "jira", name: "Jira", description: "Link deployments to Jira issues for traceability" },
];

export async function getIntegrations(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const dbIntegrations = await prisma.projectIntegration.findMany({
    where: { projectId },
  });

  const integrationMap = new Map(dbIntegrations.map((i) => [i.service, i]));

  return AVAILABLE_SERVICES.map((service) => {
    const db = integrationMap.get(service.id);
    return {
      ...service,
      connected: db?.status === "connected",
      connectedAt: db?.connectedAt?.toISOString() ?? null,
      config: db?.config || "{}",
    };
  });
}

export async function connectIntegration(projectId: string, serviceId: string, config?: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  await prisma.projectIntegration.upsert({
    where: { projectId_service: { projectId, service: serviceId } },
    update: { status: "connected", config: JSON.stringify(config || {}), connectedAt: new Date() },
    create: { projectId, service: serviceId, status: "connected", config: JSON.stringify(config || {}), connectedAt: new Date() },
  });

  revalidatePath(`/dashboard/projects/${projectId}/integrations`);
}

export async function disconnectIntegration(projectId: string, serviceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  await prisma.projectIntegration.updateMany({
    where: { projectId, service: serviceId },
    data: { status: "disconnected", config: "{}", connectedAt: null },
  });

  revalidatePath(`/dashboard/projects/${projectId}/integrations`);
}
