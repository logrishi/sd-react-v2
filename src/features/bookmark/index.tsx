import { useEffect, useState, type FC } from "@/lib/vendors";
import { store } from "@/services/store";
import { getBooks } from "@/services/backend/actions";
import { Card, CardContent } from "@/components/common/ui/card";
import { Bookmark as BookmarkIcon } from "@/assets/icons";
import BookCard from "../home/components/book-card";
import AudioBookCard from "../home/components/audio-book-card";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "@/lib/hooks/useAccessControl";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  audio?: string;
  is_free: boolean;
}

const Bookmark: FC = () => {
  const { books: bookmarkedIds } = store.bookmark() as any;
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAccess } = useAccessControl();

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
              <div className="space-y-8">
                {/* Audio Stories */}
                {bookmarkedBooks.filter((book) => book.audio).length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">Audio Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarkedBooks
                        .filter((book) => book.audio)
                        .map((book) => {
                          const { canAccess } = checkAccess(book.is_free);
                          return (
                            <AudioBookCard
                              key={book.id}
                              id={book.id}
                              name={book.name}
                              audio={book.audio || ""}
                              isFree={book.is_free}
                              canPlay={canAccess}
                              bookmarkedBooks={bookmarkedIds}
                              onBookmarkToggle={handleRemoveBookmark}
                            />
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Books */}
                {bookmarkedBooks.filter((book) => !book.audio).length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold tracking-tight">E-Books (Books/Magazines)</h2>
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {bookmarkedBooks
                        .filter((book) => !book.audio)
                        .map((book) => (
                          <BookCard
                            key={book.id}
                            id={book.id}
                            name={book.name}
                            description={book.description}
                            category={book.category}
                            image={book.image}
                            isFree={book.is_free}
                            showCategory={true}
                            bookmarkedBooks={bookmarkedIds}
                            onBookmarkToggle={handleRemoveBookmark}
                          />
                        ))}
                    </div>
                  </div>
                )}
                {bookmarkedBooks.length === 0 && (
                  <Card className="col-span-full p-6 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="rounded-full bg-muted p-6">
                        <BookmarkIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-muted-foreground">No bookmarks yet</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start adding books to your bookmarks to see them here.
                      </p>
                    </div>
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
