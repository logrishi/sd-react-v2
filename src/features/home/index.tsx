import { type FC } from "@/lib/vendors";
import BookCardSkeleton from "./components/book-card-skeleton";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/common/ui/card";
import { Switch } from "@/components/common/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { BookmarkIcon, BookOpen, Headphones, IndianRupee } from "@/assets/icons";
import { store } from "@/services/store";
import { useEffect, useState } from "react";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { getBooks, getSettings } from "@/services/backend/actions";
import { sanitizeText } from "@/lib/utils/text-utils";
import { Badge } from "@/components/common/ui/badge";
import { getEnvVar } from "@/lib/utils/env-vars";
import { useNavigate } from "react-router-dom";
import { homeBanner } from "@/assets/images";
import Pay from "@/features/pay";
import NativeActions from "../native-actions";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  is_free: boolean;
}

const Home: FC = () => {
  const { books, searchQuery, selectedCategory, showFreeOnly = false } = store.library();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { checkAccess } = useAccessControl();
  const navigate = useNavigate();
  const { isLoggedIn, isSubscribed, isSubscriptionExpired } = store.auth.get();

  // Check access status and set alert message
  useEffect(() => {
    const { canAccess, message } = checkAccess();

    if (!canAccess) {
      setShowAlert(true);

      if (!isLoggedIn || !isSubscribed) {
        setAlertMessage("Subscribe to gain access to e-books and audiobooks");
      } else if (isSubscriptionExpired) {
        setAlertMessage("Renew your subscription to continue access to e-books and audiobooks");
      } else {
        setAlertMessage(message);
      }
    } else {
      setShowAlert(false);
    }
  }, [isLoggedIn, isSubscribed, isSubscriptionExpired]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsResponse, booksResponse] = await Promise.all([getSettings(), getBooks()]);
        console.log("booksResponse", booksResponse);
        if (!booksResponse.err) {
          store.library.set({ books: booksResponse.result });
        }

        if (!settingsResponse.err && settingsResponse.result?.length > 0) {
          const categories = settingsResponse.result.find(
            (s: { setting_key: string }) => s.setting_key === "categories"
          );
          const price = settingsResponse.result.find((s: { setting_key: string }) => s.setting_key === "price");

          store.appSettings.set({
            categories: categories?.config || [],
            price: price?.value || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    store.library.set({ searchQuery: sanitizeText(query) });
  };

  const handleCategoryChange = (category: string) => {
    store.library.set({ selectedCategory: category });
  };

  const toggleFreeFilter = () => {
    store.library.set({ showFreeOnly: !showFreeOnly });
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
    // If no search query, category is 'all', and not filtering for free books, show all books
    if (!searchQuery && selectedCategory === "all" && !showFreeOnly) {
      return true;
    }

    // Apply free filter if enabled
    const matchesFree = !showFreeOnly || book.is_free;

    // Apply search filter if there's a query
    const matchesSearch =
      !searchQuery ||
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply category filter if a specific category is selected
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;

    return matchesSearch && matchesCategory && matchesFree;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NativeActions />

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="container py-6 space-y-4">
          {/* Subscription Alert */}
          {showAlert && <Pay />}
          {/* Banner */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Discover Our Library</h2>
            </div>
            <div className="relative">
              <Card className="text-white overflow-hidden shadow-lg relative h-[260px]">
                {/* Full-screen background image */}
                <div className="absolute inset-0 w-full h-full">
                  <img src={homeBanner} alt="Digital reading experience" className="w-full h-full object-cover" />
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
              <div className="flex items-center space-x-3">
                <Switch
                  checked={showFreeOnly}
                  onCheckedChange={toggleFreeFilter}
                  className="data-[state=checked]:bg-primary"
                />
                <div className="flex items-center space-x-1.5">
                  {/* <IndianRupee className={cn("h-4 w-4", showFreeOnly ? "text-muted-foreground line-through" : "text-primary")} /> */}
                  <span className="text-sm font-medium leading-none">Free Books Only</span>
                </div>
              </div>
            </div>
            <Tabs defaultValue={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
              <TabsList className="w-full justify-start mb-4 bg-transparent">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  All
                </TabsTrigger>
                {store.appSettings.get().categories.map((category: string) => (
                  <TabsTrigger
                    key={category}
                    value={category.toLowerCase()}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Books Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <BookCardSkeleton key={n} />
                ))}
              </div>
            ) : displayedBooks.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-muted p-6">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-muted-foreground">No results found</h3>
                </div>
              </Card>
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
                      {book.is_free ? (
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-success/80 text-white hover:bg-success/20">
                            Free
                          </Badge>
                        </div>
                      ) : null}
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
                          className={`h-8 w-8 bg-background/80 hover:bg-background/80 ${bookmarkedBooks.includes(book.id) ? "text-primary" : ""}`}
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
              </div>
            )}
          </section>
        </div>
      </main>

      {/* SubscribeSheet removed */}
    </div>
  );
};

export default Home;
