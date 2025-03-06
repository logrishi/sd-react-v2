import { useState, type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Textarea } from "@/components/common/ui/textarea";
import { Star } from "@/assets/icons";

interface ReviewFormProps {
  onSubmit: (rating: number, review: string) => void;
  isLoading?: boolean;
}

const ReviewForm: FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, review);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <Star
                className={`h-6 w-6 ${
                  value <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Your Review</label>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here..."
          className="min-h-[100px]"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading || rating === 0 || !review.trim()} className="w-full">
        {isLoading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
