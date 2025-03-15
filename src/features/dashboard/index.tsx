import { Card } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { store } from "@/services/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBooks, getUsers } from "@/services/backend/actions";
import { User } from "lucide-react";

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

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  expiry_date: string;
  last_login: string;
  is_subscribed: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const user: any = store.auth.get().user;
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksResponse, usersResponse] = await Promise.all([getBooks(), getUsers()]);

        if (!booksResponse.err) {
          setBooks(booksResponse.result || []);
        }

        if (!usersResponse.err) {
          setUsers(usersResponse.result || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const stats = {
    books: {
      ebooks: books.filter((b) => !b.audio && b.category === "Books").length,
      audio: books.filter((b) => b.audio && b.category === "Books").length,
    },
    magazines: {
      ebooks: books.filter((b) => !b.audio && b.category === "Magazines").length,
      audio: books.filter((b) => b.audio && b.category === "Magazines").length,
    },
    audioStories: books.filter((b) => b.category === "Audio Stories").length,
    users: {
      active: users.filter((u) => u.is_subscribed && new Date(u.expiry_date) > new Date()).length,
      expired: users.filter((u) => u.is_subscribed && new Date(u.expiry_date) <= new Date()).length,
      notSubscribed: users.filter((u) => !u.is_subscribed).length,
    },
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Quick Stats */}
        <Card className="p-4 col-span-1 md:col-span-3">
          <h3 className="text-base font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Books */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Books</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-primary">{loading ? "..." : stats.books.ebooks}</span>
                  <span className="text-sm text-muted-foreground">E-Books</span>
                </div>
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-primary">{loading ? "..." : stats.books.audio}</span>
                  <span className="text-sm text-muted-foreground">Audio</span>
                </div>
              </div>
            </div>

            {/* Magazines */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Magazines</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-primary">{loading ? "..." : stats.magazines.ebooks}</span>
                  <span className="text-sm text-muted-foreground">E-Books</span>
                </div>
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-primary">{loading ? "..." : stats.magazines.audio}</span>
                  <span className="text-sm text-muted-foreground">Audio</span>
                </div>
              </div>
            </div>

            {/* Audio Stories */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Audio Stories</h4>
              <div className="text-center bg-muted/30 rounded-lg p-3">
                <span className="block text-2xl font-bold text-primary">{loading ? "..." : stats.audioStories}</span>
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
            </div>

            {/* Users */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Users</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-success">{loading ? "..." : stats.users.active}</span>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-destructive">{loading ? "..." : stats.users.expired}</span>
                  <span className="text-sm text-muted-foreground">Expired</span>
                </div>
                <div className="text-center bg-muted/30 rounded-lg p-3">
                  <span className="block text-2xl font-bold text-muted-foreground">{loading ? "..." : stats.users.notSubscribed}</span>
                  <span className="text-sm text-muted-foreground">Not Sub.</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4 col-span-1">
          <h3 className="text-base font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="h-14 w-full flex flex-row items-center justify-center gap-2"
              onClick={() => navigate("/admin/add-book")}
            >
              <span className="text-lg">➕</span>
              <span className="text-sm">Add New Book</span>
            </Button>
            <Button
              variant="outline"
              className="h-14 w-full flex flex-row items-center justify-center gap-2"
              onClick={() => navigate("/admin/books")}
            >
              <span className="text-lg">🔍</span>
              <span className="text-sm">Manage Books</span>
            </Button>
            <Button
              variant="outline"
              className="h-14 w-full flex flex-row items-center justify-center gap-2"
              onClick={() => navigate("/admin/users")}
            >
              <User className="h-5 w-5" />
              <span className="text-sm">Manage Users</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
