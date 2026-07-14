import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { StorageManager } from "./StorageManager";

export default async function StoragePage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) notFound();

  const buckets = await prisma.storageBucket.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text mb-1">Storage</h2>
        <p className="text-muted text-sm">
          Manage storage buckets for{" "}
          <span className="text-text font-medium">{project.name}</span>
        </p>
      </div>

      <StorageManager
        projectId={project.id}
        buckets={buckets.map((b) => ({
          id: b.id,
          name: b.name,
          visibility: b.visibility,
          region: b.region,
          createdAt: b.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
