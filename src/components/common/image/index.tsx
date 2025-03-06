import { cn } from "@/lib/utils/utils";
import { forwardRef, useState } from "@/lib/vendors";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  hoverEffect?: "zoom" | "scale" | "blur" | "fade" | "none";
  containerClassName?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    { className, src, fallbackSrc, aspectRatio = "auto", hoverEffect = "none", containerClassName, alt, ...props },
    ref
  ) => {
    const [error, setError] = useState(false);

    const aspectRatioClasses = {
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]",
      auto: "aspect-auto",
    };

    const hoverEffectClasses = {
      zoom: "group-hover:scale-110",
      scale: "group-hover:scale-105",
      blur: "group-hover:blur-sm",
      fade: "group-hover:opacity-75",
      none: "",
    };

    const handleError = () => {
      if (!error && fallbackSrc) {
        setError(true);
      }
    };

    // If containerClassName is provided, wrap the image in a div
    if (containerClassName) {
      return (
        <div className={cn("group overflow-hidden", containerClassName)}>
          <img
            ref={ref}
            src={error ? fallbackSrc : src}
            alt={alt}
            onError={handleError}
            className={cn(
              "object-cover w-full transition-all duration-300",
              aspectRatioClasses[aspectRatio],
              hoverEffectClasses[hoverEffect],
              className
            )}
            {...props}
          />
        </div>
      );
    }

    // If no containerClassName, just return the image
    return (
      <img
        ref={ref}
        src={error ? fallbackSrc : src}
        alt={alt}
        onError={handleError}
        className={cn("object-cover w-full transition-all duration-300", aspectRatioClasses[aspectRatio], className)}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";
