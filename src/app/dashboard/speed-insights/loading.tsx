import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function SpeedInsightsLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-40 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="mb-8 space-y-4">
        <SkeletonLine className="h-4 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <SkeletonLine className="h-5 w-16" />
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-2 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <SkeletonLine className="h-4 w-40" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-t border-border">
            <div className="grid grid-cols-5 gap-4 items-center">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-3 w-12 hidden md:block" />
              <SkeletonLine className="h-3 w-10 hidden sm:block" />
              <SkeletonLine className="h-3 w-14 hidden sm:block" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
