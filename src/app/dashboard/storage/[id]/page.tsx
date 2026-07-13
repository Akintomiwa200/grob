import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Database, ArrowLeft, Folder, Globe, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteBucket, updateBucket } from "../actions";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `Bucket | Storage | Grob` };
}

export default async function StorageDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await props.params;

  const bucket = await prisma.storageBucket.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!bucket) notFound();

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-6">
        <Link
          href="/dashboard/storage"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Storage
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text font-mono">
              {bucket.name}
            </h1>
            <p className="text-muted text-sm mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                  bucket.visibility === "public"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {bucket.visibility === "public" ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {bucket.visibility}
              </span>
              <span className="text-border">·</span>
              <span>{bucket.region}</span>
              <span className="text-border">·</span>
              <span>Created {new Date(bucket.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Bucket Name</p>
          <p className="text-lg font-bold text-text font-mono">{bucket.name}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Visibility</p>
          <p className="text-lg font-bold text-text capitalize">{bucket.visibility}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Region</p>
          <p className="text-lg font-bold text-text">{bucket.region}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-4">
          <p className="text-xs text-muted mb-1">Project</p>
          <p className="text-lg font-bold text-text">
            {bucket.projectId ? "Linked" : "Standalone"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <Folder className="h-4 w-4 text-accent" /> Files
          </h2>
          <span className="text-xs text-muted">
            Files are managed via API or CLI
          </span>
        </div>
        <div className="px-6 py-12 text-center">
          <Database className="h-8 w-8 text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted mb-2">
            Upload files to this bucket using the Grob CLI or API.
          </p>
          <pre className="text-xs text-accent bg-bg border border-border rounded-lg px-4 py-2 inline-block font-mono">
            grob storage push --bucket {bucket.name} ./dist
          </pre>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/20 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Bucket Settings</h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Bucket Name</label>
            <input
              defaultValue={bucket.name}
              disabled
              className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50 opacity-60 cursor-not-allowed"
            />
          </div>
          <form action={updateBucket.bind(null, bucket.id)}>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Visibility</label>
              <select
                name="visibility"
                defaultValue={bucket.visibility}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium text-text">Danger Zone</p>
              <p className="text-xs text-muted">Permanently delete this bucket and all its files.</p>
            </div>
            <form action={deleteBucket.bind(null, bucket.id)}>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Bucket
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
