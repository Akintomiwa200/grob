import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-32 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/20 p-6 space-y-4">
          <SkeletonLine className="h-4 w-36" />
          <div className="flex items-end gap-3 h-40 pt-4">
            {[40, 70, 50, 80, 30, 60, 45].map((pct, i) => (
              <div key={i} className="flex-1 rounded-t bg-white/[0.06] animate-pulse" style={{ height: `${pct}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-4">
          <SkeletonLine className="h-4 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-t border-border">
              <SkeletonLine className="h-3 w-28" />
              <SkeletonLine className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-3">
          <SkeletonLine className="h-4 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-2 flex-1" />
              <SkeletonLine className="h-3 w-8" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-3">
          <SkeletonLine className="h-4 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-t border-border">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-3 w-6 ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-3">
        <SkeletonLine className="h-4 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-t border-border">
            <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
            <SkeletonLine className="h-4 w-40" />
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-3 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
