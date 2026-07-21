export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`}
    />
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 w-full ${className}`} />;
}

export function SkeletonCircle({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-10 w-10 rounded-full ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface/20 p-5 space-y-3 ${className}`}>
      <SkeletonLine className="h-5 w-1/3" />
      <SkeletonLine className="h-3 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-xl border border-border bg-surface/20 p-5 space-y-2">
      <SkeletonLine className="h-3 w-20" />
      <SkeletonLine className="h-7 w-16" />
      <SkeletonLine className="h-3 w-24" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface/20 overflow-hidden">
      <div className="p-4 border-b border-border bg-surface/30">
        <SkeletonLine className="h-4 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
          <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-1/3" />
            <SkeletonLine className="h-3 w-1/4" />
          </div>
          <SkeletonLine className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  const gridCols = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}
