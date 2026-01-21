import { SearchResultsSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="container-default py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="container-default py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar Skeleton */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="card p-6 space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-11 flex-1" />
                  <Skeleton className="h-11 flex-1" />
                </div>
              </div>
            </div>
          </aside>

          {/* Results Skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
            <SearchResultsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
