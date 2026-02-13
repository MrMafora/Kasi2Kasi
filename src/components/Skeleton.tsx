"use client";

export function CardSkeleton() {
  return (
    <div className="card animate-shimmer">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-16 bg-gray-200 rounded-xl" />
        <div className="h-16 bg-gray-200 rounded-xl" />
        <div className="h-16 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card animate-shimmer space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-2.5 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="gradient-green px-4 pt-10 pb-6 rounded-b-3xl animate-shimmer">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-white/20 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-white/20 rounded w-1/2" />
          <div className="h-3 bg-white/20 rounded w-2/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-16 bg-white/10 rounded-xl" />
        <div className="h-16 bg-white/10 rounded-xl" />
        <div className="h-16 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-12 space-y-4">
      <div className="animate-shimmer space-y-2 mb-6">
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <CardSkeleton />
      <ListSkeleton rows={3} />
    </div>
  );
}

export default function Skeleton({ type = "card" }: { type?: "card" | "list" | "header" | "dashboard" }) {
  switch (type) {
    case "list": return <ListSkeleton />;
    case "header": return <HeaderSkeleton />;
    case "dashboard": return <DashboardSkeleton />;
    default: return <CardSkeleton />;
  }
}
