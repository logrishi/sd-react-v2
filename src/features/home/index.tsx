import { createElement, type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/common/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { SearchIcon } from "lucide-react";
import { store } from "@/services/store";
import { useEffect, useState } from "react";
import { getBooks } from "@/services/backend/actions";
import BookCard from "@/components/book-card";
import { sanitizeText } from "@/lib/utils/text-utils";

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  sample: string;
}

const Home: FC = () => {
  const { books, searchQuery, selectedCategory } = store.library();
  const [loading, setLoading] = useState(false);

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

  const handleBookmark = (bookId: string) => {
    // TODO: Implement bookmarking functionality
    console.log("Bookmark clicked:", bookId);
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <div
          className="w-full h-[300px] sm:h-[400px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80')",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">Discover Your Next Read</h1>
            <p className="text-white/90 mt-2 max-w-xl drop-shadow-md">
              Explore our curated collection of books across various categories
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search and Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-8"
              value={searchQuery || ""}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Tabs defaultValue={selectedCategory} onValueChange={handleCategoryChange} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="fiction" className="text-xs sm:text-sm">
                Fiction
              </TabsTrigger>
              <TabsTrigger value="non-fiction" className="text-xs sm:text-sm">
                Non-Fiction
              </TabsTrigger>
              <TabsTrigger value="technology" className="text-xs sm:text-sm">
                Technology
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="animate-pulse shadow-sm border-0">
                <div className="aspect-[16/9] bg-muted" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-4/5 bg-muted rounded" />
                    <div className="flex justify-between">
                      <div className="h-3 w-1/4 bg-muted rounded" />
                      <div className="h-3 w-1/6 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedBooks.map((book) => (
              <BookCard key={book.id} book={book} onBookmark={handleBookmark} bookmarked={false} />
            ))}
            {displayedBooks?.length === 0 && searchQuery && (
              <Card className="col-span-full p-6 text-center">
                <CardTitle className="text-muted-foreground">No books found</CardTitle>
                <CardDescription>Try adjusting your search or filters to find what you're looking for.</CardDescription>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
