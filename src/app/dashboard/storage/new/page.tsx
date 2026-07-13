import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { createBucket } from "../actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Bucket | Storage | Grob" };

export default async function NewBucketPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const regions = [
    { value: "us-east-1", label: "US East (Virginia)" },
    { value: "us-west-1", label: "US West (Oregon)" },
    { value: "eu-west-1", label: "EU West (Ireland)" },
    { value: "eu-central-1", label: "EU Central (Frankfurt)" },
    { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
    { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  ];

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <Link
        href="/dashboard/storage"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Storage
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">Create Bucket</h1>
        <p className="text-muted text-sm mt-1">
          Set up a new storage bucket for files and static assets.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-8">
        <form action={createBucket} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-text">
              Bucket Name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="my-bucket"
              pattern="[a-z0-9\-]+"
              className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
            <p className="text-xs text-muted mt-1.5">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text">Visibility</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  defaultChecked
                  className="w-4 h-4 text-accent bg-surface/30 border-border focus:ring-accent focus:ring-2"
                />
                <div>
                  <span className="text-sm font-medium text-text">Public</span>
                  <p className="text-xs text-muted">Readable by anyone on the internet</p>
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  className="w-4 h-4 text-accent bg-surface/30 border-border focus:ring-accent focus:ring-2"
                />
                <div>
                  <span className="text-sm font-medium text-text">Private</span>
                  <p className="text-xs text-muted">Requires signed URLs to access</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium mb-1.5 text-text">
              Region
            </label>
            <select
              id="region"
              name="region"
              defaultValue="us-east-1"
              className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
            >
              {regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="projectId" className="block text-sm font-medium mb-1.5 text-text">
              Project
            </label>
            <select
              id="projectId"
              name="projectId"
              className="w-full rounded-lg border border-border bg-surface/30 px-3 py-2 text-sm text-text focus:border-accent focus:outline-none transition-colors"
            >
              <option value="">No project (standalone)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-bg bg-text rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Bucket
            </button>
            <Link
              href="/dashboard/storage"
              className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-accent" />
          <h3 className="font-semibold text-text">Pricing</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border border-border bg-surface/30 p-4">
            <p className="text-muted text-xs mb-1">Storage</p>
            <p className="font-semibold text-text">$0.023 / GB / month</p>
            <p className="text-xs text-muted mt-1">First 5 GB free</p>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-4">
            <p className="text-muted text-xs mb-1">Bandwidth</p>
            <p className="font-semibold text-text">$0.09 / GB</p>
            <p className="text-xs text-muted mt-1">First 100 GB free</p>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-4">
            <p className="text-muted text-xs mb-1">Operations</p>
            <p className="font-semibold text-text">$0.005 / 1K requests</p>
            <p className="text-xs text-muted mt-1">PUT, GET, DELETE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
