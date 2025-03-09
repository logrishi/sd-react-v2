import { Card } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { store } from "@/services/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBooks } from "@/services/backend/actions";

interface Book {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  book: string;
  audio?: string;
  is_free: boolean;
  is_deleted: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const user: any = store.auth.get().user;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await getBooks();
        if (!response.err) {
          setBooks(response.result || []);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">{loading ? "..." : books.length}</span>
              <span className="text-sm text-muted-foreground">Total Books</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">{loading ? "..." : books.length}</span>
              <span className="text-sm text-muted-foreground">PDF Books</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">{loading ? "..." : books.filter(b => b.audio).length}</span>
              <span className="text-sm text-muted-foreground">Audio Books</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center"
              onClick={() => navigate("/admin/add-book")}
            >
              <span className="text-2xl mb-1">➕</span>
              Add New Book
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center"
              onClick={() => navigate("/admin/books")}
            >
              <span className="text-2xl mb-1">🔍</span>
              Manage Books
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
