"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deployProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) throw new Error("Project not found");

  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "building",
      branch: "main",
      commitSha: crypto.randomUUID().slice(0, 40),
      commitMsg: "Manual deploy",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);

  simulateDeployInBackground(project, deployment.id);
}

async function simulateDeployInBackground(
  project: { id: string; name: string; installCommand: string; buildCommand: string; outputDir: string; framework: string },
  deploymentId: string
) {
  const logs: string[] = [];
  const log = (line: string) => logs.push(line);
  const timestamp = () => new Date().toISOString().split("T")[1].split(".")[0];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    log(`[${timestamp()}] Cloning repository...`);
    await sleep(600);
    log(`[${timestamp()}] Cloned main branch successfully`);
    await sleep(200);

    log(`[${timestamp()}] Installing dependencies...`);
    log(`[${timestamp()}] $ ${project.installCommand}`);
    await sleep(1000);
    log(`[${timestamp()}] ✓ Dependencies installed`);

    await sleep(200);
    log(`[${timestamp()}] Detected framework: ${project.framework || "Unknown"}`);
    await sleep(200);

    log(`[${timestamp()}] Running build...`);
    log(`[${timestamp()}] $ ${project.buildCommand}`);
    await sleep(1500);
    log(`[${timestamp()}] ✓ Build completed successfully`);

    await sleep(200);
    log(`[${timestamp()}] Collecting output from ${project.outputDir}...`);
    await sleep(400);
    log(`[${timestamp()}] ✓ Assets collected`);

    await sleep(200);
    const hash = crypto.randomUUID().slice(0, 12);
    const url = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${hash}.grob.app`;

    log(`[${timestamp()}] Deploying to production...`);
    await sleep(600);
    log(`[${timestamp()}] ✓ Deployment complete!`);
    log(`[${timestamp()}] URL: https://${url}`);

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "success", logs: logs.join("\n"), url },
    });
  } catch (err) {
    log(`[${timestamp()}] ✗ Deployment failed: ${err}`);
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "failed", logs: logs.join("\n") },
    });
  }

  revalidatePath(`/dashboard/projects/${project.id}`);
}
