import { createElement, type FC } from "@/lib/vendors";
import BookCardSkeleton from "./components/book-card-skeleton";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from "@/components/common/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { SearchIcon, BellIcon, Share2Icon, BookmarkIcon, ChevronRightIcon, BookOpen, Headphones } from "lucide-react";
import { store } from "@/services/store";
import { useEffect, useState } from "react";
import { SubscribeSheet } from "@/components/common/subscribe-sheet";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { getBooks } from "@/services/backend/actions";
import { sanitizeText } from "@/lib/utils/text-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/ui/avatar";
import { Badge } from "@/components/common/ui/badge";
import { getEnvVar } from "@/lib/utils/env-vars";
import { useNavigate } from "react-router-dom";
import { homeBanner } from "@/assets/images";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}

const Home: FC = () => {
  const { books, searchQuery, selectedCategory } = store.library();
  const [loading, setLoading] = useState(false);
  const [showSubscribeSheet, setShowSubscribeSheet] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const { checkAccess } = useAccessControl();
  const navigate = useNavigate();

  // Check access when component mounts
  useEffect(() => {
    const { message, showSubscribeSheet: shouldShow } = checkAccess();
    if (shouldShow) {
      setSubscribeMessage(message);
      setShowSubscribeSheet(true);
    }
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await getBooks();
        if (!response.err) {
          store.library.set({ books: response.result });
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = (query: string) => {
    store.library.set({ searchQuery: sanitizeText(query) });
  };

  const handleCategoryChange = (category: string) => {
    store.library.set({ selectedCategory: category });
  };

  const { books: bookmarkedBooks } = store.bookmark() as any;

  const handleBookmark = (bookId: number) => {
    const isBookmarked = bookmarkedBooks.includes(bookId);
    const updatedBookmarks = isBookmarked
      ? bookmarkedBooks.filter((id: number) => id !== bookId)
      : [...bookmarkedBooks, bookId];
    store.bookmark.set({ books: updatedBookmarks });
  };

  // Only filter books if there's a search query or category selected
  const displayedBooks = (books as Book[]).filter((book) => {
    // If no search query and category is 'all', show all books
    if (!searchQuery && selectedCategory === "all") {
      return true;
    }

    // Apply search filter if there's a query
    const matchesSearch =
      !searchQuery ||
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply category filter if a specific category is selected
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main Content */}
      <main className="flex-1">
        {/* Bottom Sheet */}
        <SubscribeSheet
          isOpen={showSubscribeSheet}
          onClose={() => setShowSubscribeSheet(false)}
          message={subscribeMessage}
          persistent={true}
          hasBottomTabs={true}
        />
        <div className="container py-6 space-y-4">
          {/* Banner */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Discover Our Library</h2>
            </div>
            <div className="relative">
              <Card className="text-white overflow-hidden shadow-lg relative h-[260px]">
                {/* Full-screen background image */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={homeBanner}
                    alt="Digital reading experience"
                    className="w-full h-full object-cover"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/60"></div>
                </div>
                
                {/* Content */}
                <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-2 p-6 h-full">
                  <div className="space-y-4 flex flex-col justify-center">
                    <div>
                      <h3 className="text-2xl font-bold">Your Complete Digital Library</h3>
                      <p className="text-white/90 mt-2">
                        Access our extensive collection of e-books and audiobooks anytime, anywhere.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs py-1">
                        <Headphones className="h-3 w-3 mr-1" />
                        Audiobooks
                      </Badge>
                      <Badge variant="secondary" className="text-xs py-1">
                        <BookOpen className="h-3 w-3 mr-1" />
                        E-Books
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Top Selling */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Explore Our Collection</h2>
            </div>
            <Tabs defaultValue={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
              <TabsList className="w-full justify-start mb-4 bg-transparent">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="fiction"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Fiction
                </TabsTrigger>
                <TabsTrigger
                  value="non-fiction"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Non-Fiction
                </TabsTrigger>
                <TabsTrigger
                  value="technology"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Technology
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Books Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <BookCardSkeleton key={n} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedBooks.map((book) => (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <Badge variant="secondary" className="bg-background/80 hover:bg-background/80">
                          {book.category}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 bg-background/80 hover:bg-background/80 ${bookmarkedBooks.includes(book.id) ? "text-red-500" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(book.id);
                          }}
                        >
                          <BookmarkIcon
                            className="h-4 w-4"
                            fill={bookmarkedBooks.includes(book.id) ? "currentColor" : "none"}
                          />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold leading-none tracking-tight line-clamp-2">{book.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{book.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between"></CardFooter>
                  </Card>
                ))}
                {displayedBooks?.length === 0 && searchQuery && (
                  <Card className="col-span-full p-6 text-center">
                    <CardTitle className="text-muted-foreground">No books found</CardTitle>
                    <CardDescription>
                      Try adjusting your search or filters to find what you're looking for.
                    </CardDescription>
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

export default Home;
