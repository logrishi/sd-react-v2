import { type FC, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/common/ui/table";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, Headphones, HeadphoneOff, Eye, Loader2 } from "@/assets/icons";
import { getBooks, deleteBook } from "@/services/backend/actions";
import { getEnvVar } from "@/lib/utils/env-vars";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/common/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/common/ui/alert-dialog";
import { Badge } from "@/components/common/ui/badge";
import { Loading } from "@/components/common/loading";

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

const Books: FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Remove is_deleted filter to show all books in admin view
      const response = await getBooks({ sort: "-created_at", filter: "" });
      if (!response.err) {
        setBooks(response.result || []);
      } else {
        setError("Failed to load books");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("An error occurred while fetching books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const response = await deleteBook(id);
      if (!response.err) {
        // Update the book's is_deleted status in the local state instead of removing it
        setBooks(
          books.map((book) => {
            if (book.id === id) {
              return { ...book, is_deleted: true };
            }
            return book;
          })
        );
      } else {
        setError("Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      setError("An error occurred while deleting the book");
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Books</CardTitle>
            <CardDescription>Manage your books</CardDescription>
          </div>
          <Button onClick={() => navigate("/admin/add-book")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}

          {loading ? (
            <Loading size="md" className="py-8" />
          ) : books.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No books found</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/add-book")}>
                Add your first book
              </Button>
            </div>
          ) : (
            <>
              {/* Table view for larger screens */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Has Audio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`${getEnvVar("VITE_IMAGE_URL")}/${book.image}`} alt={book.name} />
                            <AvatarFallback>{book.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{book.name}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>{formatPrice(book.price, book.is_free)}</TableCell>
                        <TableCell>
                          {book.audio ? (
                            <Headphones className="h-4 w-4 text-success" />
                          ) : (
                            <HeadphoneOff className="h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                        </TableCell>
                        <TableCell>
                          {book.is_deleted ? (
                            <Badge variant="destructive">Deleted</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/edit-book/${book.id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/book/${book.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will mark the book as deleted. It will no longer be visible to users but will
                                    remain in the admin panel.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(book.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={deleteLoading === book.id}
                                  >
                                    {deleteLoading === book.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Mark as Deleted
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Card view for mobile screens */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                {books.map((book) => (
                  <Card key={book.id} className="overflow-hidden group flex flex-col h-full">
                    {/* Image section - fixed height */}
                    <div className="relative h-36 overflow-hidden">
                      {book.image ? (
                        <img
                          src={`${getEnvVar("VITE_IMAGE_URL")}/${book.image}`}
                          alt={book.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-3xl font-bold text-muted-foreground">{book.name.charAt(0)}</span>
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        {book.is_deleted ? (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            Deleted
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-xs px-1 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Content section - fixed heights for each part */}
                    <CardContent className="p-3 flex-1 flex flex-col">
                      {/* Title section - fixed height */}
                      <div className="h-6 mb-1">
                        <h3 className="font-bold text-base truncate" title={book.name}>
                          {book.name}
                        </h3>
                      </div>

                      {/* Category/Price section - fixed height */}
                      <div className="flex justify-between items-center h-5 mb-1">
                        <span className="text-xs text-muted-foreground truncate max-w-[60%]">{book.category}</span>
                        <span className="text-xs font-medium">{formatPrice(book.price, book.is_free)}</span>
                      </div>

                      {/* Audio indicator section - fixed height */}
                      <div className="h-5 mb-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          {book.audio ? (
                            <Headphones className="h-3 w-3 text-success mr-1" />
                          ) : (
                            <HeadphoneOff className="h-3 w-3 text-muted-foreground opacity-50 mr-1" />
                          )}
                          <span>{book.audio ? "Has Audio" : "No Audio"}</span>
                        </div>
                      </div>

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-1"></div>

                      {/* Action buttons - fixed height */}
                      <div className="flex justify-center space-x-2 pt-2 border-t h-10 mt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/edit-book/${book.id}`)}
                          className="h-7 w-7"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/book/${book.id}`)}
                          className="h-7 w-7"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will mark the book as deleted. It will no longer be visible to users but will
                                remain in the admin panel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(book.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={deleteLoading === book.id}
                              >
                                {deleteLoading === book.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                                ) : null}
                                Mark as Deleted
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Books;
