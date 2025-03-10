import { type FC } from "@/lib/vendors";
import { Star, StarHalf } from "@/assets/icons";

interface RatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const Rating: FC<RatingProps> = ({ value, size = "md", showValue = false }) => {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 !== 0;

  const starSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`star-${i}`} className={`${starSize[size]} fill-warning text-warning`} />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<StarHalf key="half-star" className={`${starSize[size]} fill-warning text-warning`} />);
  }

  // Add empty stars
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-star-${i}`} className={`${starSize[size]} text-gray-300`} />);
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showValue && <span className="ml-1 text-sm text-muted-foreground">({value?.toFixed(1)})</span>}
    </div>
  );
};

export default Rating;
