import { type FC } from "@/lib/vendors";
import { Card } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Bookmark } from "@/assets/icons";
import { cn } from "@/lib/utils/utils";
import { getEnvVar } from "@/lib/utils/env-vars";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}

interface BookCardProps {
  book: Book;
  isBookmarked?: boolean;
  onBookmarkClick?: (bookId: number) => void;
  onCardClick?: (bookId: number) => void;
  showCategory?: boolean;
}

const BookCard: FC<BookCardProps> = ({
  book,
  isBookmarked = false,
  onBookmarkClick,
  onCardClick,
  showCategory = true,
}) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkClick?.(book.id);
  };

  return (
    <Card className="group overflow-hidden cursor-pointer" onClick={() => onCardClick?.(book.id)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={`${getEnvVar("VITE_IMAGE_URL")}/${book.image}`}
          alt={book.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          {showCategory && (
            <Badge variant="secondary" className="bg-background/80 hover:bg-background/80">
              {book.category}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 bg-background/80 hover:bg-background/80", isBookmarked && "text-red-500")}
            onClick={handleBookmarkClick}
          >
            <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold leading-none tracking-tight line-clamp-2">{book.name}</h3>
      </div>
    </Card>
  );
};

export default BookCard;
