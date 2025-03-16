import { type FC } from "@/lib/vendors";
import BookCardSkeleton from "./components/book-card-skeleton";
import AudioBookCard from "./components/audio-book-card";
import BookCard from "./components/book-card";
import { Card, CardContent } from "@/components/common/ui/card";
import { Switch } from "@/components/common/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { BookOpen, Headphones, Search, X } from "@/assets/icons";
import { store } from "@/services/store";
import { useEffect, useState } from "react";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { getBooks, getSettings } from "@/services/backend/actions";
import { sanitizeText } from "@/lib/utils/text-utils";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/common/ui/input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { homeBanner } from "@/assets/images";
import AccessMessage from "@/components/common/access-message";
import Pay from "@/features/pay";
import { Badge } from "@/components/common/ui/badge";
import NativeActions from "../native-actions";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  audio?: string;
  is_free: boolean;
}

const Home: FC = () => {
  const { books, showFreeOnly = false } = store.library();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 800);

  // Initialize selectedCategory with the first category from settings
  const defaultCategory = store.appSettings.get().categories[0];
  const selectedCategory = store.library.get().selectedCategory || defaultCategory;
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsResponse, booksResponse] = await Promise.all([getSettings(), getBooks()]);
      if (!booksResponse.err) {
        store.library.set({ books: booksResponse.result });
      }

      if (!settingsResponse.err && settingsResponse.result?.length > 0) {
        const categories = settingsResponse.result.find((s: { setting_key: string }) => s.setting_key === "categories");
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

  useEffect(() => {
    // Set initial category and fetch data
    store.library.set({ selectedCategory: defaultCategory });
    fetchData();
  }, [defaultCategory]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // if (!query) {
    //   setSearchResults([]);
    //   fetchData(); // Reload original data when search is cleared
    // }
  };

  const clearSearch = () => {
    handleSearch("");
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearch.length >= 3) {
        setSearchLoading(true);
        try {
          const response = await getBooks({
            filter: "is_deleted:0",
            sort: "-created_at",
            search: `name~*${debouncedSearch}*`,
          });
          if (!response.err) {
            setSearchResults(response.result);
          }
        } catch (error) {
          console.error("Error searching books:", error);
        } finally {
          setSearchLoading(false);
        }
      } else if (debouncedSearch.length === 0) {
        // Clear results when search is empty
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [debouncedSearch]);

  const handleCategoryChange = (category: string) => {
    store.library.set({ selectedCategory: category || defaultCategory });
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

  // Filter books based on category and free status
  const displayedBooks = ((searchQuery && searchResults) || (books as Book[])).filter((book: Book) => {
    // Apply free filter if enabled
    const matchesFree = !showFreeOnly || book.is_free;

    // Apply category filter
    const matchesCategory = book?.category === selectedCategory;

    return matchesCategory && matchesFree;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NativeActions />

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="container py-6 space-y-4">
          {/* Subscription Alert */}
          {showAlert ? <Pay /> : null}
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
                  className="data-[state=checked]:bg-success"
                />
                <div className="flex items-center space-x-1.5">
                  {/* <IndianRupee className={cn("h-4 w-4", showFreeOnly ? "text-muted-foreground line-through" : "text-primary")} /> */}
                  <span className="text-sm font-medium leading-none">Free Only</span>
                </div>
              </div>
            </div>
            <Tabs
              defaultValue={defaultCategory}
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              className="w-full"
            >
              <TabsList className="w-full justify-start mb-4 bg-transparent">
                {store.appSettings.get().categories.map((category: string) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Search Bar */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search books and audio stories..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-10 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {searchLoading ? (
                    <span className="animate-pulse">Searching...</span>
                  ) : (
                    <>
                      {displayedBooks.length} results for "{searchQuery}"
                    </>
                  )}
                </p>
                <button onClick={clearSearch} className="text-sm text-primary hover:underline">
                  Clear search
                </button>
              </div>
            )}

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
                  <h3 className="text-xl font-semibold text-muted-foreground">
                    {showFreeOnly ? (
                      <>
                        No <span className="font-bold">Free</span> content available
                      </>
                    ) : (
                      "No results found"
                    )}
                  </h3>
                </div>
              </Card>
            ) : selectedCategory === "Audio Stories" ? (
              <div>
                {!showFreeOnly && (!isLoggedIn || !isSubscribed || isSubscriptionExpired) && (
                  <Card className="p-6 mb-4">
                    <AccessMessage
                      isLoggedIn={isLoggedIn}
                      isSubscribed={isSubscribed}
                      isSubscriptionExpired={isSubscriptionExpired}
                      showFreeOnly={showFreeOnly}
                    />
                  </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedBooks.map((book) => {
                    const { canAccess } = checkAccess(book.is_free);
                    return (
                      <AudioBookCard
                        key={book.id}
                        id={book.id}
                        name={book.name}
                        audio={book.audio ? book.audio : ""}
                        isFree={book.is_free}
                        canPlay={canAccess}
                        bookmarkedBooks={bookmarkedBooks}
                        onBookmarkToggle={handleBookmark}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    name={book.name}
                    description={book.description}
                    category={book.category}
                    image={book.image}
                    isFree={book.is_free}
                    bookmarkedBooks={bookmarkedBooks}
                    onBookmarkToggle={handleBookmark}
                  />
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
