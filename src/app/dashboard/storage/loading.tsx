import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function StorageLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <SkeletonLine className="h-8 w-28 mb-2" />
          <SkeletonLine className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-3 w-8" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-t border-border">
            <div className="grid grid-cols-5 gap-4 items-center">
              <SkeletonLine className="h-4 w-28" />
              <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
              <SkeletonLine className="h-3 w-20 hidden md:block" />
              <SkeletonLine className="h-3 w-20 hidden md:block" />
              <SkeletonLine className="h-3 w-10 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
