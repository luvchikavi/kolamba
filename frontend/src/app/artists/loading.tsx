import { ArtistCardSkeleton } from "@/components/ui/Skeleton";

export default function ArtistsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-10">
          <div className="h-4 w-24 bg-slate-200 rounded mb-6 animate-pulse" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="h-10 w-48 bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="h-5 w-64 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-64 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-11 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="container-default py-10">
        <div className="h-5 w-32 bg-slate-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ArtistCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
