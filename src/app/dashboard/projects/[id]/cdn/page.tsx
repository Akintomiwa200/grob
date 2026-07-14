import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCdnData } from "./actions";
import { CdnManager } from "./CdnManager";

export default async function CdnPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const data = await getCdnData(project.id);

  return <CdnManager projectId={project.id} initial={data} />;
}
