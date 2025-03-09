import { useEffect, useParams, useState, useOptimistic, useMemo, type FC } from "@/lib/vendors";
import { Bookmark } from "@/assets/icons";
import { store } from "@/services/store";
import { Button } from "@/components/common/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { SubscribeSheet } from "@/components/common/subscribe-sheet";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import Rating from "@/components/common/rating";
import AudioPlayer from "@/components/common/audio-player";
import ReviewForm from "@/components/common/review-form";
import { getBook, getBookReviews, submitBookReview } from "@/services/backend/actions";
import { Image } from "@/components/common/image";
import { getEnvVar } from "@/lib/utils/env-vars";
import BookSkeleton from "@/features/home/components/book-details-skeleton";
import PdfViewer from "@/components/pdf-viewer";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface BookDetails {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  book: string;
  audio?: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

const BookDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const [book, setBook] = useState<BookDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubscribeSheet, setShowSubscribeSheet] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const { checkAccess } = useAccessControl();
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [pdfSource, setPdfSource] = useState("");
  const [optimisticReviews, addOptimisticReview] = useOptimistic(reviews, (state: Review[], newReview: Review) => [
    ...state,
    newReview,
  ]);
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

          const reviewsResponse = await getBookReviews(id!);
          if (!reviewsResponse.err) {
            setReviews(reviewsResponse.result);
          }
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

  const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!id || !book) return;

    setIsSubmitting(true);

    // Create optimistic review
    const optimisticReview: Review = {
      id: Date.now().toString(),
      userId: "temp",
      userName: "You",
      rating,
      review: reviewText,
      createdAt: new Date().toISOString(),
    };

    // Add optimistic review
    addOptimisticReview(optimisticReview);

    try {
      const response = await submitBookReview(id, { rating, review: reviewText });
      if (!response.err) {
        const reviewsResponse = await getBookReviews(id);
        if (!reviewsResponse.err) {
          setReviews(reviewsResponse.result);
        }
      } else {
        setError(response.result);
        // Remove optimistic review on error
        setReviews(reviews);
      }
    } catch (err: any) {
      setError(err.message);
      // Remove optimistic review on error
      setReviews(reviews);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !book) {
    return <BookSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <SubscribeSheet
        isOpen={showSubscribeSheet}
        onClose={() => setShowSubscribeSheet(false)}
        message={subscribeMessage}
        persistent={false}
        hasBottomTabs={false}
      />
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
              className={`absolute right-2 top-2 bg-white/80 hover:bg-white ${isBookmarked ? "text-red-500" : ""}`}
              onClick={() => handleBookmarkToggle(book.id)}
            >
              <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
            </Button>
          )}
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">{book.name}</h1>
          <div className="flex items-center justify-center gap-4">
            <Rating value={book.averageRating} showValue />
            <span className="text-sm text-gray-600">({optimisticReviews.length} reviews)</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="about">About Book</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-8 pb-20">
          <div className="prose max-w-none">
            <p>{book.description}</p>
          </div>

          <div className="rounded-lg border p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold">Read Book</h2>
            <Button
              className="w-full"
              size="lg"
              onClick={async () => {
                const { canAccess, message, showSubscribeSheet: shouldShow } = checkAccess();
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
                } else if (shouldShow) {
                  setSubscribeMessage(message);
                  setShowSubscribeSheet(true);
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
                const { canAccess, message, showSubscribeSheet: shouldShow } = checkAccess();
                const audioUrl = `${getEnvVar("VITE_IMAGE_URL")}/audio/${book.audio}`;
                
                if (canAccess) {
                  return <AudioPlayer audioUrl={audioUrl} />;
                } else {
                  return (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        if (shouldShow) {
                          setSubscribeMessage(message);
                          setShowSubscribeSheet(true);
                        }
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
                <p className="text-sm text-gray-500">
                  We're working on creating an immersive audio experience for this book.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-8 pb-20">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
            <ReviewForm onSubmit={handleReviewSubmit} isLoading={isSubmitting} />
          </div>

          <div className="space-y-6">
            {optimisticReviews.map((review) => (
              <div key={review.id} className="space-y-2 border-b pb-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{review.userName}</span>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <Rating value={review.rating} size="sm" />
                <p className="text-gray-700">{review.review}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      {isPdfVisible && (
        <PdfViewer 
          pdfSource={pdfSource} 
          onClose={() => {
            setIsPdfVisible(false);
            setPdfSource("");
          }} 
        />
      )}
    </div>
  );
};

export default BookDetails;
