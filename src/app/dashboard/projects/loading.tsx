import { Skeleton, SkeletonCard, SkeletonLine } from "@/components/Skeleton";

export default function ProjectsLoading() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto text-text animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <SkeletonLine className="h-7 w-28" />
          <SkeletonLine className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
