import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function DomainsLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <SkeletonLine className="h-8 w-28 mb-2" />
          <SkeletonLine className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg mb-6" />
      <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0">
            <SkeletonLine className="h-4 w-40" />
            <SkeletonLine className="h-3 w-24 hidden md:block" />
            <SkeletonLine className="h-3 w-12 hidden sm:block" />
            <SkeletonLine className="h-3 w-14 hidden sm:block" />
            <SkeletonLine className="h-3 w-10 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
