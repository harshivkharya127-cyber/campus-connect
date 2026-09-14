import { Skeleton } from "@/components/ui";

/**
 * Placeholder shown while a listing page streams in. Mirrors the real
 * card-grid layout so the page doesn't jump when content arrives.
 */
export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading content">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}