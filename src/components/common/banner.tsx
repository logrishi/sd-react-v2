import { cn } from "@/lib/utils/utils";
import { Sheet, SheetContent } from "@/components/common/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { BannerConfig, BannerPosition, defaultBannerConfig } from "@/lib/config/banner.config";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface BannerProps extends Partial<BannerConfig> {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const getPositionStyles = (position: BannerPosition): string => {
  switch (position) {
    case "bottom-with-tabs":
      return "bottom-[64px]"; // Height of bottom tabs
    case "bottom":
      return "bottom-0";
    case "center":
      return "top-1/2 -translate-y-1/2";
    case "top":
      return "top-0";
    default:
      return "bottom-0";
  }
};

export const Banner = ({
  children,
  isOpen,
  onClose,
  position = defaultBannerConfig.position,
  showBackdrop = defaultBannerConfig.showBackdrop,
  dismissible = defaultBannerConfig.dismissible,
  persistent = defaultBannerConfig.persistent,
  showCloseButton = defaultBannerConfig.showCloseButton,
  containerClassName,
}: BannerProps) => {
  // Don't render if not open and not persistent
  if (!isOpen && !persistent) return null;

  // For center position, use a different layout
  if (position === "center") {
    return (
      <div
        className={cn("fixed inset-0 z-[100] flex items-center justify-center", showBackdrop && "bg-black/50")}
        onClick={dismissible ? onClose : undefined}
      >
        <div
          className={cn("bg-white rounded-lg shadow-lg max-w-md w-full mx-4", containerClassName)}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }

  // For other positions, use Sheet component
  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={!persistent ? onClose : undefined}
      modal={!persistent}
    >
      <SheetContent
        side="bottom"
        onEscapeKeyDown={!persistent ? onClose : undefined}
        onInteractOutside={!persistent ? onClose : undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "fixed bg-white border-t z-[60] p-0",
          !persistent && "rounded-t-3xl shadow-lg",
          position === "bottom-with-tabs" ? "inset-x-0" : "left-1/2 -translate-x-1/2",
          containerClassName
        )}
        style={{
          bottom: "0",
          maxHeight: position === "bottom-with-tabs" ? 
            "calc(100vh - 128px)" : // Account for bottom tabs
            "calc(100vh - 64px)", // Just account for header
          width: position === "bottom-with-tabs" ? "100%" : "min(500px, 100vw)",
          marginBottom: position === "bottom-with-tabs" ? "64px" : "0",
          ...(position !== "bottom-with-tabs" && {
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "100%",
            minHeight: "fit-content"
          })
        }}
      >
        <div 
          className={cn(
            "relative w-full px-6 py-4",
            position === "bottom-with-tabs" ? "w-full" : "max-w-[500px] mx-auto"
          )}
        >
          {showCloseButton && (
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 cursor-pointer z-50"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
