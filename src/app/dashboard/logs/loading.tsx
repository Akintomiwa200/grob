import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function LogsLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-24 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 space-y-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <SkeletonLine className="h-4 w-32" />
            <SkeletonLine className="h-3 w-48" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <SkeletonLine className="h-4 w-36" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3 border-b border-border last:border-b-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-3 w-20" />
            </div>
            <SkeletonLine className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
