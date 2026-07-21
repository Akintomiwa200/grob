import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function ObservabilityLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-40 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <SkeletonLine className="h-4 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-t border-border">
            <div className="grid grid-cols-5 gap-4 items-center">
              <SkeletonLine className="h-4 w-28" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <SkeletonLine className="h-3 w-16" />
              <SkeletonLine className="h-3 w-14" />
              <SkeletonLine className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-3">
          <SkeletonLine className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-t border-border">
              <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              <SkeletonLine className="h-4 w-36" />
              <SkeletonLine className="h-3 w-12 ml-auto" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-3">
          <SkeletonLine className="h-4 w-36" />
          <div className="grid grid-cols-3 gap-4 py-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <SkeletonLine className="h-6 w-10 mx-auto" />
                <SkeletonLine className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-t border-border">
              <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              <SkeletonLine className="h-3 w-32" />
              <SkeletonLine className="h-3 w-10 ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface/20 p-6 flex items-center gap-6">
        <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonLine className="h-4 w-48" />
          <SkeletonLine className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
      </div>
    </div>
  );
}
