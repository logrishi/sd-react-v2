import { type FC, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/common/ui/card";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Button } from "@/components/common/ui/button";
import { Textarea } from "@/components/common/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/ui/select";
import { Checkbox } from "@/components/common/ui/checkbox";
import { useNavigate, useParams } from "react-router-dom";
import { IndianRupee, FileText, Headphones, Image, Loader2, Eye } from "@/assets/icons";
import { getEnvVar } from "@/lib/utils/env-vars";
import { store } from "@/services/store";
import { createBook, getBook, updateBook, uploadMedia } from "@/services/backend/actions";
import { clearCache } from "@/services/backend/cache";
import AudioPlayer from "@/components/common/audio-player";
import { Toast } from "@/components/common/ui/toast";

interface BookFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  image: string;
  book: string;
  audio: string;
  is_free: boolean;
  is_deleted: boolean;
}

const AddBook: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { categories } = store.appSettings.get();

  const [formData, setFormData] = useState<BookFormData>({
    name: "",
    description: "",
    category: "",
    price: "",
    image: "",
    book: "",
    audio: "",
    is_free: false,
    is_deleted: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchBook = async () => {
        try {
          setLoading(true);
          const response = await getBook(id);
          if (!response.err && response.result) {
            const book = response.result[0];
            setFormData({
              name: book.name || "",
              description: book.description || "",
              category: book.category || "",
              price: book.price ? String(book.price) : "",
              image: book.image || "",
              book: book.book || "",
              audio: book.audio || "",
              is_free: !!book.is_free,
              is_deleted: !!book.is_deleted,
            });

            // Set image preview if available
            if (book.image) {
              const imageUrl = `${getEnvVar("VITE_IMAGE_URL")}/${book.image}`;
              setImagePreview(imageUrl);
            }
          } else {
            setError("Failed to load book data or book not found");
          }
        } catch (error) {
          console.error("Error fetching book:", error);
          setError("Failed to load book data");
        } finally {
          setLoading(false);
        }
      };

      fetchBook();
    }
  }, [id, isEditMode]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up any object URLs created for local file previews
      if (imageFile && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, imageFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous preview
      if (imagePreview && !imagePreview.startsWith("http")) {
        URL.revokeObjectURL(imagePreview);
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBookFile(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate required fields
      const errors = [];
      if (!formData.name?.trim()) errors.push("Name");
      if (!formData.category?.trim()) errors.push("Category");
      if (!isEditMode && !bookFile) errors.push("PDF Document");
      if (!isEditMode && !imageFile) errors.push("Cover Image");

      if (errors.length > 0) {
        setError(`${errors.join(", ")} ${errors.length === 1 ? "is" : "are"} required`);
        setShowToast(true);
        setLoading(false);
        return;
      }

      // Handle file uploads
      let imageUrl = formData.image;
      let bookUrl = formData.book;
      let audioUrl = formData.audio;

      // Upload image if changed
      if (imageFile) {
        try {
          // uploadMedia will automatically compress image files
          const uploadResponse = await uploadMedia(imageFile, "images");
          imageUrl = uploadResponse?.files?.image;
        } catch (error) {
          console.error("Error uploading image:", error);
          setError("Failed to upload image");
          setShowToast(true);
          setLoading(false);
          return;
        }
      }

      // Upload book if changed
      if (bookFile) {
        try {
          const uploadResponse = await uploadMedia(bookFile, "books");
          bookUrl = uploadResponse?.files?.image;
        } catch (error) {
          console.error("Error uploading book:", error);
          setError("Failed to upload book");
          setShowToast(true);
          setLoading(false);
          return;
        }
      }

      // Upload audio if changed
      if (audioFile) {
        try {
          const uploadResponse = await uploadMedia(audioFile, "audios");
          audioUrl = uploadResponse?.files?.image;
        } catch (error) {
          console.error("Error uploading audio:", error);
          setError("Failed to upload audio");
          setShowToast(true);
          setLoading(false);
          return;
        }
      }

      // Prepare data for API
      const bookData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : 0,
        image: imageUrl,
        book: bookUrl,
        audio: audioUrl,
        is_free: formData.is_free,
        is_deleted: formData.is_deleted,
      };

      // Create or update book
      let response;
      if (isEditMode) {
        response = await updateBook(id, bookData);
      } else {
        response = await createBook(bookData);
      }

      if (response.err) {
        throw new Error(response.err.message || "Failed to save book");
      }

      // Clear cache to ensure fresh data is loaded after adding/updating
      clearCache("products");
      
      setSuccess(isEditMode ? "Book updated successfully" : "Book created successfully");
      setShowToast(true);

      // Reset form if creating new product
      if (!isEditMode) {
        setFormData({
          name: "",
          description: "",
          category: "",
          price: "",
          image: "",
          book: "",
          audio: "",
          is_free: false,
          is_deleted: false,
        });
        setImageFile(null);
        setBookFile(null);
        setAudioFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview("");
        }
      }

      // Navigate back after a delay
      setTimeout(() => {
        navigate("/admin/books");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6">
      {/* Floating toast notifications */}
      {error && showToast && (
        <Toast 
          variant="destructive" 
          position="topCenter" 
          onClose={() => setShowToast(false)}
        >
          {error}
        </Toast>
      )}

      {success && showToast && (
        <Toast 
          variant="success" 
          position="topCenter" 
          onClose={() => setShowToast(false)}
        >
          {success}
        </Toast>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Book" : "Add New Book"}</CardTitle>
          <CardDescription>
            {isEditMode ? "Update the book information" : "Fill in the details to create a new book"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={4}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange(value, "category")}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md bg-muted">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-12"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Cover Image {!isEditMode && "*"}</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative border rounded-md p-4 flex items-center hover:bg-muted/50 transition-colors">
                    {imagePreview && (
                      <div className="h-16 w-16 rounded-md overflow-hidden border flex-shrink-0 mr-4">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div
                      className="flex-1 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      <Image className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {imagePreview
                          ? `${isEditMode && formData.image ? "Change" : "Replace"} cover image`
                          : "Upload cover image"}
                      </p>
                      {isEditMode && formData.image && imagePreview && (
                        <p className="text-xs text-muted-foreground mt-1 text-center truncate max-w-[200px]">
                          Current: {formData.image.split("/").pop()}
                        </p>
                      )}
                    </div>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label htmlFor="book">PDF Document {!isEditMode && "*"}</Label>
                <div className="relative border rounded-md p-4 flex items-center hover:bg-muted/50 transition-colors">
                  {formData.book && (
                    <div
                      className="h-12 w-12 rounded-full bg-info/10 flex-shrink-0 mr-4 flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open PDF in new tab
                        if (formData.book) {
                          const pdfUrl = `${getEnvVar("VITE_IMAGE_URL")}/${formData.book}`;
                          window.open(pdfUrl, "_blank");
                        }
                      }}
                    >
                      <Eye className="h-6 w-6 text-info" />
                    </div>
                  )}
                  <div
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => document.getElementById("book")?.click()}
                  >
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      {bookFile
                        ? bookFile.name
                        : formData.book
                          ? isEditMode
                            ? `Current PDF: ${formData.book.split("/").pop() || "document.pdf"} (click to change)`
                            : "PDF already uploaded (click to change)"
                          : "Upload PDF document"}
                    </p>
                  </div>
                  <input
                    id="book"
                    type="file"
                    accept=".pdf"
                    onChange={handleBookChange}
                    disabled={loading}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Audio Upload */}
              <div className="space-y-2">
                <Label htmlFor="audio">Audio File</Label>
                <div className="relative border rounded-md p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center w-full">
                    {formData.audio && (
                      <div className="flex-shrink-0 mr-4">
                        <AudioPlayer audioUrl={`${getEnvVar("VITE_IMAGE_URL")}/${formData.audio}`} miniPlayer={true} />
                      </div>
                    )}
                    <div
                      className="flex-1 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => document.getElementById("audio")?.click()}
                    >
                      <Headphones className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {audioFile
                          ? audioFile.name
                          : formData.audio
                            ? isEditMode
                              ? `Current Audio: ${formData.audio.split("/").pop() || "audio.mp3"} (click to change)`
                              : "Audio already uploaded (click to play/change)"
                            : "Upload audio file"}
                      </p>
                    </div>
                    <input
                      id="audio"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, "is_free")}
                    disabled={loading}
                  />
                  <Label htmlFor="is_free" className="cursor-pointer">
                    Free Book
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_deleted"
                    checked={formData.is_deleted}
                    onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, "is_deleted")}
                    disabled={loading}
                  />
                  <Label htmlFor="is_deleted" className="cursor-pointer">
                    Mark as Deleted
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/books")} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Book" : "Add Book"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBook;
