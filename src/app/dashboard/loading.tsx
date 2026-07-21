import { Skeleton, SkeletonCard, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto text-text animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-10 flex-1 max-w-xl rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3 space-y-8">
          <div className="rounded-xl border border-border bg-surface/20 p-4 space-y-3">
            <SkeletonLine className="h-4 w-20" />
            <div className="space-y-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/20 p-6 text-center space-y-3">
            <SkeletonLine className="h-4 w-32 mx-auto" />
            <Skeleton className="h-9 w-28 mx-auto rounded-lg" />
          </div>
          <div className="space-y-3">
            <SkeletonLine className="h-4 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <div className="flex justify-between mb-6">
            <SkeletonLine className="h-5 w-24" />
            <SkeletonLine className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
