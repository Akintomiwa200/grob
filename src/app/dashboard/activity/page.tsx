import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const deployments = await prisma.deployment.findMany({
    where: { project: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { project: { select: { name: true, id: true } } },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-400",
    building: "bg-blue-400",
    success: "bg-green-400",
    failed: "bg-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Activity</h1>

      {deployments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {deployments.map((dep) => (
            <Link
              key={dep.id}
              href={`/dashboard/projects/${dep.project.id}/deployments/${dep.id}`}
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${statusColors[dep.status]?.split(" ")[0] || "bg-gray-400"}`} />
                <div>
                  <p className="text-sm font-medium">{dep.project.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dep.commitMsg || "Manual deploy"} &middot; {dep.branch}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(dep.createdAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
