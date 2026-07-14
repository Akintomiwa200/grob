import { prisma } from "@/lib/prisma";
import { deployBuild, logEntriesToString, type BuildEnvVars } from "@/lib/build";
import { createHmac, timingSafeEqual } from "crypto";

function verifySignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await props.params;

  const rawBody = await req.text();

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    include: {
      webhooks: { where: { active: true } },
      envVars: true,
    },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.webhooks.length === 0) {
    return Response.json({ ok: true, skipped: "no active webhooks" });
  }

  const signature = req.headers.get("x-hub-signature-256");
  const secret = project.webhooks[0].secret;
  if (!verifySignature(rawBody, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = {};
  }

  const commitMsg = body?.head_commit?.message || body?.commits?.[0]?.message || "Auto-deploy via webhook";
  const commitSha = body?.after || body?.head_commit?.id || crypto.randomUUID().slice(0, 40);
  const branch = (body?.ref || "refs/heads/main").replace("refs/heads/", "");

  const buildTimeVars: Record<string, string> = {};
  const runtimeVars: Record<string, string> = {};
  for (const ev of project.envVars) {
    if (ev.buildTime) {
      buildTimeVars[ev.key] = ev.value;
    } else {
      runtimeVars[ev.key] = ev.value;
    }
  }

  const envVars: BuildEnvVars = {
    buildTime: buildTimeVars,
    runtime: runtimeVars,
  };

  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: "building",
      branch,
      commitSha,
      commitMsg,
    },
  });

  // Fire-and-forget: run build in background so GitHub gets a fast 200
  (async () => {
    const entries: import("@/lib/build").LogEntry[] = [];
    try {
      const url = await deployBuild(
        {
          name: project.name,
          gitUrl: project.gitUrl,
          installCommand: project.installCommand,
          buildCommand: project.buildCommand,
          outputDir: project.outputDir,
          framework: project.framework,
        },
        deployment.id,
        (entry) => {
          entries.push(entry);
          prisma.deployment.update({
            where: { id: deployment.id },
            data: { logs: logEntriesToString(entries) },
          }).catch(() => {});
        },
        envVars,
      );

      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: url ? "success" : "failed",
          logs: logEntriesToString(entries),
          url: url || "",
        },
      });
    } catch (error) {
      console.error("Webhook build failed:", error);
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: "failed", logs: logEntriesToString(entries) },
      }).catch(() => {});
    }
  })();

  return Response.json({
    ok: true,
    deploymentId: deployment.id,
    status: "building",
  });
}
