import { Skeleton, SkeletonLine, SkeletonStat } from "@/components/Skeleton";

export default function AiGatewayLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-32 mb-2" />
        <SkeletonLine className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-4 w-32" />
              <SkeletonLine className="h-3 w-48" />
            </div>
            <SkeletonLine className="h-3 w-16" />
            <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
