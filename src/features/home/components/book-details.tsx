import { useEffect, useParams, useState, useMemo, type FC } from "@/lib/vendors";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Bookmark } from "@/assets/icons";
import { store } from "@/services/store";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import AudioPlayer from "@/components/common/audio-player";
import { getBook } from "@/services/backend/actions";
import { Image } from "@/components/common/image";
import { getEnvVar } from "@/lib/utils/env-vars";
import BookSkeleton from "@/features/home/components/book-details-skeleton";
import Pay from "@/features/pay";
import { data, useNavigate } from "react-router-dom";
import PdfViewer from "@/components/pdf-viewer";
import { sendToNative } from "@/lib/utils/utils";

interface BookDetails {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  book: string;
  audio?: string;
  is_free: boolean;
}

const BookDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [pdfSource, setPdfSource] = useState("");

  // Handle navigation state
  useEffect(() => {
    const handlePopState = () => {
      if (isPdfVisible) {
        setIsPdfVisible(false);
        setPdfSource("");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isPdfVisible]);
  const { isLoggedIn, isSubscribed, isSubscriptionExpired } = store.auth.get();
  const { books: bookmarkedBooks } = store.bookmark() as any;

  const handleBookmarkToggle = (bookId: number) => {
    const isBookmarked = bookmarkedBooks.includes(bookId);
    const updatedBookmarks = isBookmarked
      ? bookmarkedBooks.filter((id: number) => id !== bookId)
      : [...bookmarkedBooks, bookId];
    store.bookmark.set({ books: updatedBookmarks });
  };

  const isBookmarked = useMemo(() => {
    if (!book) return false;
    return bookmarkedBooks.includes(book.id);
  }, [book, bookmarkedBooks]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bookResponse = await getBook(id!);
        if (!bookResponse.err) {
          setBook(bookResponse.result[0]);
        } else {
          setError(bookResponse.result);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  if (isLoading || !book) {
    return <BookSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-start justify-between"></div>

      <div className="mb-4 grid gap-4">
        <div className="relative h-[400px] overflow-hidden rounded-lg">
          <Image
            src={`${getEnvVar("VITE_IMAGE_URL")}/${book.image}`}
            alt={book.name}
            className="h-full w-full object-cover"
          />
          {book?.is_free ? (
            <div className="absolute top-2 left-4 z-10">
              <Badge variant="secondary" className="bg-success/80 text-white hover:bg-success/20">
                Free
              </Badge>
            </div>
          ) : null}
          {book ? (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 bg-background/80 hover:bg-background/90 ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleBookmarkToggle(book.id)}
            >
              <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
            </Button>
          ) : null}
        </div>

        <div className="relative">
          <div className="space-y-4 text-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{book.name}</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                {book.category ? (
                  <Badge variant="secondary" className="bg-foreground  text-background hover:bg-foreground/80">
                    {book.category}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 pb-20">
        <div className="prose max-w-none">
          <p>{book.description}</p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg md:text-xl font-semibold text-center">Read Book</h2>
          {(() => {
            const { canAccess, message, requiresLogin, requiresSubscription } = useAccessControl().checkAccess(
              book?.is_free
            );

            if (!canAccess) {
              if (requiresLogin) {
                return (
                  <div className="text-center">
                    <p className="mb-4 text-muted-foreground">{message}</p>
                    <Button className="w-full" size="lg" onClick={() => navigate("/login")}>
                      Login
                    </Button>
                  </div>
                );
              }

              if (requiresSubscription) {
                return <Pay />;
              }
            }

            return (
              <div className="text-center">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    const pdfUrl = `${getEnvVar("VITE_IMAGE_URL")}/${book.book}`;
                    setPdfSource(pdfUrl);
                    setIsPdfVisible(true);
                  }}
                >
                  Read Now
                </Button>
              </div>
            );
          })()}
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg md:text-xl font-semibold text-center">Listen to Audio Book</h2>
          {(() => {
            if (!book.audio) {
              return (
                <div className="space-y-4 py-8 text-center">
                  <div className="text-4xl">🎧</div>
                  <p className="text-sm md:text-base text-gray-600">Audio version coming soon!</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    We're working on creating an immersive audio experience for this book.
                  </p>
                </div>
              );
            }

            const { canAccess, message, requiresLogin, requiresSubscription } = useAccessControl().checkAccess(
              book.is_free
            );

            if (!canAccess) {
              if (requiresLogin) {
                return (
                  <div className="text-center">
                    <p className="mb-4 text-muted-foreground">{message}</p>
                    <Button className="w-full" size="lg" onClick={() => navigate("/login")}>
                      Login
                    </Button>
                  </div>
                );
              }

              if (requiresSubscription) {
                return <Pay />;
              }
            }

            return <AudioPlayer audioUrl={`${getEnvVar("VITE_IMAGE_URL")}/${book.audio}`} />;
          })()}
        </div>
      </div>
      <PdfViewer isOpen={isPdfVisible} onClose={() => setIsPdfVisible(false)} pdfUrl={pdfSource} title={book.name} />
    </div>
  );
};

export default BookDetails;
