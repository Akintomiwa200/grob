import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function ConnectLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-28 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 space-y-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <SkeletonLine className="h-4 w-28" />
            <SkeletonLine className="h-3 w-48" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <SkeletonLine className="h-4 w-36" />
        </div>
        <div className="p-16 text-center">
          <SkeletonLine className="h-4 w-48 mx-auto" />
        </div>
      </div>
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 space-y-4">
        <SkeletonLine className="h-4 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
