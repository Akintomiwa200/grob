import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Globe2, Info } from "lucide-react";
import { addDomain } from "./actions";

export default async function NewDomainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <Link
        href="/dashboard/domains"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Domains
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Add Domain</h1>
        <p className="text-muted text-sm mt-1">
          Connect a custom domain to one of your projects.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <form action={addDomain} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-text">
              Domain Name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="example.com"
              className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium mb-1.5 text-text">
              Project
            </label>
            <select
              id="projectId"
              name="projectId"
              required
              className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {projects.length === 0 && (
              <p className="text-xs text-muted mt-1.5">
                No projects found.{" "}
                <Link href="/dashboard/projects/new" className="text-accent hover:underline">
                  Create one first
                </Link>
                .
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={projects.length === 0}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-bg bg-text rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Add Domain
            </button>
            <Link
              href="/dashboard/domains"
              className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-text">DNS Configuration</h3>
          </div>
          <p className="text-sm text-muted mb-4">
            After adding your domain, configure DNS records at your registrar:
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface/30 p-4">
              <h4 className="text-sm font-medium text-text mb-2">Option A — A Record (recommended)</h4>
              <div className="rounded-lg bg-bg/80 border border-border p-3 font-mono text-xs space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">Type</span>
                  <span className="text-text">A</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">Name</span>
                  <span className="text-text">@</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">Value</span>
                  <span className="text-accent">76.76.21.21</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">TTL</span>
                  <span className="text-text">600</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface/30 p-4">
              <h4 className="text-sm font-medium text-text mb-2">Option B — CNAME Record</h4>
              <div className="rounded-lg bg-bg/80 border border-border p-3 font-mono text-xs space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">Type</span>
                  <span className="text-text">CNAME</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">Name</span>
                  <span className="text-text">www</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">Value</span>
                  <span className="text-accent">cname.grob.dev</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted w-16 shrink-0">TTL</span>
                  <span className="text-text">600</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted mt-4">
            DNS propagation can take up to 48 hours. SSL certificates are provisioned automatically once DNS is verified.
          </p>
        </div>
      </div>
    </div>
  );
}
