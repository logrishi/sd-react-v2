import { type FC } from "@/lib/vendors";
import { cn } from "@/lib/utils/utils";
import { Loader2 } from "@/assets/icons";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const Loading: FC<LoadingProps> = ({ className, size = "md", fullScreen = false }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm",
    className
  );

  const spinnerClasses = cn("animate-spin text-primary", sizeClasses[size]);

  return (
    <div className={containerClasses}>
      <Loader2 className={spinnerClasses} />
    </div>
  );
};

export default Loading;
