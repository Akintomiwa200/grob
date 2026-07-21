import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function SupportLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 px-4 py-8 animate-pulse">
      <div className="text-center space-y-3">
        <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
        <SkeletonLine className="h-8 w-40 mx-auto" />
        <SkeletonLine className="h-4 w-64 mx-auto" />
      </div>
      <Skeleton className="h-10 w-full max-w-xl mx-auto rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/20 p-5 space-y-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <SkeletonLine className="h-4 w-28" />
            <SkeletonLine className="h-3 w-40" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonLine className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border">
            <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
            <SkeletonLine className="h-4 w-48" />
            <SkeletonLine className="h-3 w-20 ml-auto" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonLine className="h-5 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface/20">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-2 w-16" />
              </div>
              <SkeletonLine className="h-3 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
