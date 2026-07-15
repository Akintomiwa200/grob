import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Ban,
  CheckCircle2,
  Save,
} from "lucide-react";
import {
  getFirewallData,
  toggleWafRule,
  saveIpList,
  toggleDdosProtection,
} from "./actions";
import { FirewallClient } from "./FirewallClient";

export default async function FirewallPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const data = await getFirewallData(id);

  return (
    <FirewallClient
      projectId={id}
      projectName={project.name}
      wafRules={data.wafRules.map((r) => ({
        id: r.id,
        ruleId: r.ruleId,
        name: r.name,
        description: r.description,
        severity: r.severity,
        enabled: r.enabled,
      }))}
      ipEntries={data.ipEntries.map((e) => ({
        id: e.id,
        type: e.type,
        cidr: e.cidr,
      }))}
      ddosConfig={{
        id: data.ddosConfig.id,
        enabled: data.ddosConfig.enabled,
        mitigatedAttacks30d: data.ddosConfig.mitigatedAttacks30d,
        peakTrafficBlocked: data.ddosConfig.peakTrafficBlocked,
        lastIncidentAt: data.ddosConfig.lastIncidentAt?.toISOString() ?? null,
      }}
    />
  );
}
