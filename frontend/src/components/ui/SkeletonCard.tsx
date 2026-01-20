export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-neutral-200" />

      <div className="p-4">
        {/* Title */}
        <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
        {/* Subtitle */}
        <div className="h-4 bg-neutral-100 rounded w-1/2 mb-3" />

        {/* Categories */}
        <div className="flex gap-1 mb-3">
          <div className="h-5 bg-neutral-100 rounded-full w-12" />
          <div className="h-5 bg-neutral-100 rounded-full w-16" />
        </div>

        {/* Bottom row */}
        <div className="flex justify-between">
          <div className="h-4 bg-neutral-100 rounded w-20" />
          <div className="h-4 bg-neutral-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
