import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllAiGatewayStats } from "@/lib/ai-gateway-actions";
import { AiGatewayClient } from "./AiGatewayClient";

export default async function AIGatewayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [routes, keys, stats] = await Promise.all([
    prisma.aiGatewayRoute.findMany({
      where: { project: { userId } },
      include: { _count: { select: { logs: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiGatewayKey.findMany({
      where: { project: { userId } },
      orderBy: { createdAt: "desc" },
    }),
    getAllAiGatewayStats(userId),
  ]);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">AI Gateway</h1>
        <p className="text-muted text-sm mt-1">
          Route, manage, and monitor AI model requests through a unified API.
        </p>
      </div>

      <AiGatewayClient
        initialRoutes={routes.map((r) => ({ ...r }))}
        initialKeys={keys.map((k) => ({
          ...k,
          createdAt: k.createdAt.toISOString(),
          lastUsed: k.lastUsed?.toISOString() ?? null,
        }))}
        stats={stats}
      />
    </div>
  );
}
