import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function WorkflowsLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-28 mb-2" />
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 space-y-2">
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="h-6 w-12" />
            <SkeletonLine className="h-2 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border bg-surface/30">
          <SkeletonLine className="h-4 w-28" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-t border-border flex items-center gap-4">
            <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
            <SkeletonLine className="h-4 w-36" />
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="h-3 w-14 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
