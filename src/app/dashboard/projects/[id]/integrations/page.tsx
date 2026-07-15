import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getIntegrations } from "./actions";
import { IntegrationsClient } from "./IntegrationsClient";

export default async function IntegrationsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const integrations = await getIntegrations(id);

  return (
    <IntegrationsClient
      projectId={id}
      projectName={project.name}
      initialIntegrations={integrations}
    />
  );
}
