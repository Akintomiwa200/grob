import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-5xl pb-12 animate-pulse">
      <div className="mb-10">
        <SkeletonLine className="h-8 w-40 mb-2" />
        <SkeletonLine className="h-4 w-80" />
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-64 shrink-0 space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1 space-y-12">
          <div className="space-y-4">
            <SkeletonLine className="h-5 w-28" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-full mx-auto" />
                  <SkeletonLine className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonLine className="h-5 w-20" />
            <div className="rounded-xl border border-border bg-surface/20 p-6 space-y-4">
              <SkeletonLine className="h-4 w-24" />
              <SkeletonLine className="h-3 w-48" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonLine className="h-5 w-28" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <div className="rounded-xl border border-border bg-surface/20 p-10 text-center">
              <Skeleton className="h-10 w-10 rounded-xl mx-auto mb-3" />
              <SkeletonLine className="h-4 w-32 mx-auto mb-1" />
              <SkeletonLine className="h-3 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
