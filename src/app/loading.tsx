import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1">
      <div className="h-16 border-b bg-background" />
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 max-w-lg" />
            <Skeleton className="h-6 w-1/2 max-w-md" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border p-6">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
