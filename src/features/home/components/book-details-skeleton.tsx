import { type FC } from "@/lib/vendors";
import { Skeleton } from "@/components/common/ui/skeleton";

const BookSkeleton: FC = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 grid gap-8">
        <div className="relative h-[400px] overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-3/4" />
          <div className="flex items-center justify-center gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
};

export default BookSkeleton;
