import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function DeploymentsLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="mb-8">
        <SkeletonLine className="h-8 w-48 mb-2" />
        <SkeletonLine className="h-4 w-64" />
      </div>
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        <div className="bg-surface/50 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            <SkeletonLine className="h-3 w-14" />
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="h-3 w-16 hidden sm:block" />
            <SkeletonLine className="h-3 w-24 hidden md:block" />
            <SkeletonLine className="h-3 w-12 hidden md:block" />
            <SkeletonLine className="h-3 w-10 ml-auto" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-t border-border">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-3 w-16 hidden sm:block" />
              <SkeletonLine className="h-3 w-32 hidden md:block" />
              <SkeletonLine className="h-3 w-14 hidden md:block" />
              <SkeletonLine className="h-3 w-10 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
