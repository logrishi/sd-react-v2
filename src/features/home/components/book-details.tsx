import { useEffect, useParams, useState, useMemo, type FC } from "@/lib/vendors";
import { Bookmark } from "@/assets/icons";
import { store } from "@/services/store";
import { Button } from "@/components/common/ui/button";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import AudioPlayer from "@/components/common/audio-player";
import { getBook } from "@/services/backend/actions";
import { Image } from "@/components/common/image";
import { getEnvVar } from "@/lib/utils/env-vars";
import BookSkeleton from "@/features/home/components/book-details-skeleton";
import PdfViewer from "@/components/pdf-viewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/common/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface BookDetails {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  book: string;
  audio?: string;
}

const BookDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const { checkAccess } = useAccessControl();
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [pdfSource, setPdfSource] = useState("");
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
          {book && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 bg-background/80 hover:bg-background/90 ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleBookmarkToggle(book.id)}
            >
              <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
            </Button>
          )}
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">{book.name}</h1>
        </div>
      </div>

      <div className="space-y-8 pb-20">
        <div className="prose max-w-none">
          <p>{book.description}</p>
        </div>

        <div className="rounded-lg border p-6 text-center">
          <h2 className="mb-4 text-xl font-semibold">Read Book</h2>
          <Button
            className="w-full"
            size="lg"
            onClick={async () => {
              const { canAccess, message } = checkAccess();
              if (canAccess) {
                try {
                  const pdfUrl = `${getEnvVar("VITE_IMAGE_URL")}/${book.book}`;
                  // Test if PDF is accessible
                  const response = await fetch(pdfUrl, { method: "HEAD" });
                  if (!response.ok) {
                    throw new Error("PDF not found or inaccessible");
                  }
                  setPdfSource(pdfUrl);
                  setIsPdfVisible(true);
                } catch (error) {
                  console.error("Error accessing PDF:", error);
                  // Handle error appropriately
                }
              } else {
                // Show subscribe dialog
                setSubscribeMessage(message);
                setShowSubscribeDialog(true);
              }
            }}
          >
            Read Now
          </Button>
        </div>

        <div className="rounded-lg border p-6 text-center">
          <h2 className="mb-4 text-xl font-semibold">Listen to Audio Book</h2>
          {book.audio ? (
            (() => {
              const { canAccess } = checkAccess();
              const audioUrl = `${getEnvVar("VITE_IMAGE_URL")}/audio/${book.audio}`;

              if (canAccess) {
                return <AudioPlayer audioUrl={audioUrl} />;
              } else {
                return (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      const { message } = checkAccess();
                      setSubscribeMessage(message);
                      setShowSubscribeDialog(true);
                    }}
                  >
                    Listen Now
                  </Button>
                );
              }
            })()
          ) : (
            <div className="space-y-4 py-8">
              <div className="text-4xl">🎧</div>
              <p className="text-gray-600">Audio version coming soon!</p>
              <p className="text-sm text-muted-foreground">
                We're working on creating an immersive audio experience for this book.
              </p>
            </div>
          )}
        </div>
      </div>
      {isPdfVisible && (
        <PdfViewer
          pdfUrl={pdfSource}
          onClose={() => {
            setIsPdfVisible(false);
            setPdfSource("");
          }}
        />
      )}

      {/* Subscribe Dialog */}
      <AlertDialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Required</AlertDialogTitle>
            <AlertDialogDescription>{subscribeMessage || "Subscribe to access this content"}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!isLoggedIn) {
                  navigate("/login");
                } else if (!isSubscribed || isSubscriptionExpired) {
                  navigate("/payments");
                }
                setShowSubscribeDialog(false);
              }}
            >
              Subscribe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookDetails;
