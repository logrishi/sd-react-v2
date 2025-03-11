import { cn } from "@/lib/utils/utils";
import { Sheet, SheetContent } from "@/components/common/ui/sheet";
import { X } from "@/assets/icons";
import { ReactNode } from "react";

interface BannerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  hasBottomTabs?: boolean;
  showBackdrop?: boolean;
  dismissible?: boolean;
  persistent?: boolean;
  showCloseButton?: boolean;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

/**
 * Banner component that can be displayed at the bottom of the screen
 * Follows the sheet behavior requirements for different pages:
 *
 * 1. Home Page (SubscribeSheet):
 * - Must be persistent (not auto-closable)
 * - No backdrop
 * - Only closable via close icon
 * - Must show above bottom tabs with proper spacing
 * - Should use hasBottomTabs={true}
 *
 * 2. Book Details Page (SubscribeSheet):
 * - Non-persistent (auto-closable)
 * - Has backdrop
 * - Should show from bottom of screen (no bottom tab spacing)
 * - Should use hasBottomTabs={false}
 * - Closable via close icon, backdrop click, and escape key
 */
export const Banner = ({
  children,
  isOpen,
  onClose,
  hasBottomTabs = false,
  showBackdrop = true,
  dismissible = true,
  persistent = false,
  showCloseButton = true,
  containerClassName,
  containerStyle,
}: BannerProps) => {
  // Don't render if not open and not persistent
  if (!isOpen && !persistent) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && dismissible && !persistent) {
          onClose();
        }
      }}
      modal={!persistent}
    >
      <SheetContent
        side="bottom"
        onEscapeKeyDown={dismissible && !persistent ? onClose : undefined}
        onInteractOutside={dismissible && !persistent ? onClose : undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "fixed bg-white border-t p-0 z-[60]",
          !persistent && "rounded-t-3xl shadow-lg",
          // Let the parent component provide all necessary positioning via containerClassName
          containerClassName
        )}
        style={{
          // Basic default styles that won't interfere with positioning
          boxSizing: "border-box",
          margin: 0,
          padding: 0,
          border: 0,
          // Add any custom styles from parent component
          ...containerStyle,
        }}
      >
        <div className="relative w-full px-6 py-4">
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
