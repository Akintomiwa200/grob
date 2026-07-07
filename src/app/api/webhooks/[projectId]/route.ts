import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  props: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await props.params;

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: { webhooks: { where: { active: true } } },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const commitMsg = body?.head_commit?.message || body?.commits?.[0]?.message || "Auto-deploy via webhook";
  const commitSha = body?.after || body?.head_commit?.id || crypto.randomUUID().slice(0, 40);
  const branch = (body?.ref || "refs/heads/main").replace("refs/heads/", "");

  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "building",
      branch,
      commitSha,
      commitMsg,
    },
  });

  simulateDeployInBackground(project, deployment.id);

  return Response.json({
    ok: true,
    deploymentId: deployment.id,
  });
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
    log(`[${timestamp()}] Webhook triggered: cloning repository...`);
    await sleep(600);
    log(`[${timestamp()}] Cloned branch successfully`);
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
}
