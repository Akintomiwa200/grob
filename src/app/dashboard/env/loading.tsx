import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function EnvLoading() {
  return (
    <div className="mx-auto max-w-5xl pb-12 space-y-8 animate-pulse">
      <div>
        <SkeletonLine className="h-8 w-56 mb-2" />
        <SkeletonLine className="h-4 w-80" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface/30 flex items-center justify-between">
              <SkeletonLine className="h-4 w-32" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="px-6 py-3 border-t border-border flex items-center gap-4">
                <SkeletonLine className="h-3 w-32" />
                <SkeletonLine className="h-3 w-48" />
                <Skeleton className="h-5 w-10 rounded-full ml-auto" />
                <Skeleton className="h-5 w-5 rounded shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
