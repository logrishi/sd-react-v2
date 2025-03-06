import { Card } from "@/components/common/ui/card";
import { getEnvVar } from "@/lib/utils/env-vars";

interface BookCardProps {
  book: Book;
  onBookmark: (bookId: string) => void;
  bookmarked: boolean;
}

interface Book {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}
const BookCard: React.FC<BookCardProps> = ({ book, onBookmark, bookmarked }) => {
  const { id, name, description, image } = book;
  const imageUrl = `${getEnvVar("VITE_IMAGE_URL")}/${image}`;

  return (
    <Card key={id} className="max-w-sm rounded overflow-hidden shadow-lg">
      <img className="w-full h-48 object-cover" src={imageUrl} alt={name} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 h-12 overflow-hidden text-ellipsis line-clamp-2" title={name}>
          {name}
        </div>
        <p className="text-gray-700 text-base h-6 overflow-hidden text-ellipsis whitespace-nowrap" title={description}>
          {description}
        </p>
      </div>
    </Card>
  );
};

export default BookCard;
