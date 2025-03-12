import { useEffect, useState, type FC } from "@/lib/vendors";
import { store } from "@/services/store";
import { getBooks } from "@/services/backend/actions";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Bookmark as BookmarkIcon } from "@/assets/icons";
import { useNavigate } from "react-router-dom";
import { getEnvVar } from "@/lib/utils/env-vars";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  is_free: boolean;
}

const Bookmark: FC = () => {
  const { books: bookmarkedIds } = store.bookmark() as any;
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await getBooks();
        if (!response.err) {
          const allBooks = response.result;
          const bookmarked = allBooks.filter((book: Book) => bookmarkedIds.includes(book.id));
          setBookmarkedBooks(bookmarked);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [bookmarkedIds]);

  const handleRemoveBookmark = (bookId: number) => {
    const updatedBookmarks = bookmarkedIds.filter((id: number) => id !== bookId);
    store.bookmark.set({ books: updatedBookmarks });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="container py-6 space-y-4">
          <section>
            {loading ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <Card key={n} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {bookmarkedBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="group overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={`${getEnvVar("VITE_IMAGE_URL")}/${book.image}`}
                        alt={book.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      {book.is_free && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-success/80 text-white hover:bg-success/20">
                            Free
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center">
                          {book.category ? (
                            <Badge variant="secondary" className="bg-background/80 hover:bg-background/80">
                              {book.category}
                            </Badge>
                          ) : null}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-background/80 hover:bg-background/80 text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(book.id);
                          }}
                        >
                          <BookmarkIcon className="h-4 w-4" fill="currentColor" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold leading-none tracking-tight line-clamp-2">{book.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{book.description}</p>
                    </CardContent>
                  </Card>
                ))}
                {bookmarkedBooks.length === 0 && (
                  <Card className="col-span-full p-6 text-center">
                    <h3 className="text-lg font-semibold text-muted-foreground">No bookmarks yet</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start adding books to your bookmarks to see them here.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Bookmark;
