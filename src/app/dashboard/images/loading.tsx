import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function ImagesLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-20 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
          <SkeletonLine className="h-4 w-28" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-bg/30 overflow-hidden">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="p-3 space-y-1">
                <SkeletonLine className="h-3 w-20" />
                <SkeletonLine className="h-2 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
