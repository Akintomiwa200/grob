import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getProjectImageStats } from "@/lib/image-actions";
import { ProjectImagesClient } from "./ProjectImagesClient";

export default async function ImagesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const [images, stats] = await Promise.all([
    prisma.optimizedImage.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    }),
    getProjectImageStats(id),
  ]);

  return (
    <ProjectImagesClient
      projectId={id}
      images={images.map((img) => ({
        ...img,
        createdAt: img.createdAt.toISOString(),
      }))}
      stats={stats}
    />
  );
}
