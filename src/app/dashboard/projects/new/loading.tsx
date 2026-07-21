import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function NewProjectLoading() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-6 text-text animate-pulse">
      <SkeletonLine className="h-8 w-36 mb-2" />
      <SkeletonLine className="h-4 w-80 mb-8" />
      <div className="flex items-center gap-3 mb-8 bg-surface/20 border border-border p-4 rounded-xl max-w-md">
        <SkeletonLine className="h-4 w-32" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        <div>
          <SkeletonLine className="h-6 w-40 mb-4" />
          <div className="border border-border rounded-xl bg-surface/30 overflow-hidden">
            <div className="p-3 border-b border-border bg-surface/30 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded shrink-0" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-4 border-b border-border last:border-b-0">
                  <div className="flex-1 space-y-1">
                    <SkeletonLine className="h-4 w-36" />
                    <SkeletonLine className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border border-border rounded-xl p-6 bg-bg/50 self-start space-y-5">
          <SkeletonLine className="h-6 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkeletonLine className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
