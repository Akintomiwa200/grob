"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Database,
  Globe,
  Lock,
  X,
  Loader2,
  MapPin,
} from "lucide-react";
import { createBucket, deleteBucket } from "./actions";

interface Bucket {
  id: string;
  name: string;
  visibility: string;
  region: string;
  createdAt: string;
}

const REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU (Ireland)" },
  { value: "eu-central-1", label: "EU (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
];

export function StorageManager({
  projectId,
  buckets,
}: {
  projectId: string;
  buckets: Bucket[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    try {
      await createBucket(projectId, formData);
      formRef.current?.reset();
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(bucketId: string) {
    setDeletingId(bucketId);
    try {
      await deleteBucket(bucketId, projectId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div />
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Bucket
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-4">
            New Storage Bucket
          </h3>
          <form
            ref={formRef}
            action={handleCreate}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">
                  Bucket Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="my-bucket"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">
                  Visibility
                </label>
                <select
                  name="visibility"
                  defaultValue="public"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">
                  Region
                </label>
                <select
                  name="region"
                  defaultValue="us-east-1"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-text bg-bg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {creating ? "Creating..." : "Create Bucket"}
            </button>
          </form>
        </div>
      )}

      {buckets.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Database className="w-10 h-10 text-muted/40 mx-auto mb-3" />
          <p className="text-sm text-muted mb-1">No storage buckets</p>
          <p className="text-xs text-muted/70">
            Create a bucket above to start storing files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {buckets.map((bucket) => (
            <div
              key={bucket.id}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <Database className="w-4 h-4 text-muted shrink-0" />
                  <span className="text-sm font-mono font-medium text-text truncate">
                    {bucket.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      bucket.visibility === "public"
                        ? "bg-success/10 text-success"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {bucket.visibility === "public" ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    {bucket.visibility}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="w-3 h-3" />
                  <span>{bucket.region}</span>
                </div>
                <p className="text-xs text-muted/70 mt-1.5">
                  Created{" "}
                  {new Date(bucket.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex justify-end mt-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => handleDelete(bucket.id)}
                  disabled={deletingId === bucket.id}
                  title="Delete bucket"
                  className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 disabled:opacity-50 transition-colors"
                >
                  {deletingId === bucket.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
