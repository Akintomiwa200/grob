import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function UsageLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-40 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 p-6 mb-6 space-y-4">
        <SkeletonLine className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between py-3 border-t border-border">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonLine className="h-4 w-48" />
          <SkeletonLine className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
      </div>
    </div>
  );
}
