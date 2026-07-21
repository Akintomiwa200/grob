import { Skeleton, SkeletonLine } from "@/components/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl pb-12 animate-pulse">
      <div className="relative mb-16 rounded-2xl bg-surface/30 border border-border overflow-hidden">
        <div className="h-32 w-full bg-gradient-to-r from-accent/20 via-blue-500/10 to-purple-500/20" />
        <div className="absolute -bottom-8 left-8 flex items-end gap-5">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-bg" />
          <div className="mb-2 space-y-2">
            <SkeletonLine className="h-7 w-40" />
            <SkeletonLine className="h-4 w-28" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
            <div className="p-5 space-y-4">
              <SkeletonLine className="h-4 w-24" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="border-t border-border bg-surface/30 px-5 py-3 flex justify-end">
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface/20">
            <div className="divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <SkeletonLine className="h-4 w-24" />
                      <SkeletonLine className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
