import { type FC } from "@/lib/vendors";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { BookmarkIcon } from "@/assets/icons";
import { getEnvVar } from "@/lib/utils/env-vars";
import { useNavigate } from "react-router-dom";
import { store } from "@/services/store";

interface BookCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  isFree: boolean;
  showCategory?: boolean;
  bookmarkedBooks: number[];
  onBookmarkToggle: (id: number) => void;
}

const BookCard: FC<BookCardProps> = ({
  id,
  name,
  description,
  category,
  image,
  isFree,
  showCategory = false,
  bookmarkedBooks,
  onBookmarkToggle,
}) => {
  const navigate = useNavigate();

  return (
    <Card key={id} className="group overflow-hidden cursor-pointer" onClick={() => navigate(`/book/${id}`)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={`${getEnvVar("VITE_IMAGE_URL")}/${image}`}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {isFree ? (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-success text-white hover:bg-success/20">
              Free
            </Badge>
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center">
            {showCategory && category ? (
              <Badge variant="secondary" className="bg-background/80 hover:bg-background/80">
                {category}
              </Badge>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 bg-background/80 hover:bg-background/80 ${bookmarkedBooks.includes(id) ? "text-primary" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(id);
            }}
          >
            <BookmarkIcon className="h-4 w-4" fill={bookmarkedBooks.includes(id) ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold leading-none tracking-tight line-clamp-2">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

export default BookCard;
