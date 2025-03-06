import { type FC } from "@/lib/vendors";
import { Skeleton } from "@/components/common/ui/skeleton";

const BookCardSkeleton: FC = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-white">
      <div className="aspect-[4/3]">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-3" />
            ))}
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
};

export default BookCardSkeleton;
