"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_WAF_RULES = [
  {
    ruleId: "sql-injection",
    name: "Block SQL Injection",
    description: "Detects and blocks common SQL injection patterns in requests",
    severity: "critical",
    enabled: true,
  },
  {
    ruleId: "rate-limiting",
    name: "Rate Limiting",
    description: "Limits request rate to 100 req/min per IP address",
    severity: "warning",
    enabled: true,
  },
  {
    ruleId: "bot-protection",
    name: "Bot Protection",
    description: "Blocks known malicious bots and scrapers via user-agent analysis",
    severity: "medium",
    enabled: false,
  },
];

export async function getFirewallData(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  let wafRules = await prisma.firewallWafRule.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  if (wafRules.length === 0) {
    const created = await Promise.all(
      DEFAULT_WAF_RULES.map((rule) =>
        prisma.firewallWafRule.create({
          data: { projectId, ...rule },
        })
      )
    );
    wafRules = created;
  }

  const ipEntries = await prisma.firewallIpEntry.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  let ddosConfig = await prisma.firewallDdosConfig.findUnique({
    where: { projectId },
  });

  if (!ddosConfig) {
    ddosConfig = await prisma.firewallDdosConfig.create({
      data: { projectId },
    });
  }

  return { wafRules, ipEntries, ddosConfig };
}

export async function toggleWafRule(projectId: string, ruleId: string, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.firewallWafRule.update({
    where: { projectId_ruleId: { projectId, ruleId } },
    data: { enabled },
  });

  revalidatePath(`/dashboard/projects/${projectId}/firewall`);
}

export async function saveIpList(projectId: string, type: string, cidrs: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.firewallIpEntry.deleteMany({
    where: { projectId, type },
  });

  const validCidrs = cidrs
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (validCidrs.length > 0) {
    await prisma.firewallIpEntry.createMany({
      data: validCidrs.map((cidr) => ({ projectId, type, cidr })),
    });
  }

  revalidatePath(`/dashboard/projects/${projectId}/firewall`);
}

export async function toggleDdosProtection(projectId: string, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.firewallDdosConfig.update({
    where: { projectId },
    data: { enabled },
  });

  revalidatePath(`/dashboard/projects/${projectId}/firewall`);
}

export async function incrementDdosAttackCount(projectId: string) {
  await prisma.firewallDdosConfig.update({
    where: { projectId },
    data: {
      mitigatedAttacks30d: { increment: 1 },
      lastIncidentAt: new Date(),
    },
  });
}
