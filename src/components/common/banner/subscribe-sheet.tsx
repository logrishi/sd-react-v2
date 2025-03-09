import React from "react";
import { type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { IndianRupee, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * SubscribeSheet component that can be used directly in any page
 * 
 * Guidelines:
 * 1. Home Page (Bottom Tabs on Small Screens):
 *    - Persistent: Not auto-closable
 *    - No backdrop
 *    - Closable via close icon only
 *    - Positioned above bottom tabs
 *
 * 2. Home Page (Medium and Large Screens):
 *    - Persistent: Not auto-closable
 *    - No backdrop
 *    - Closable via close icon only
 *    - Positioned above footer, no sidebar overflow
 *
 * 3. Book Details Page:
 *    - Non-persistent: Auto-closable
 *    - Has backdrop
 *    - Small screens: Appears from bottom (no bottom tabs)
 *    - Medium/large screens: Appears above footer
 *    - Closable via close icon, backdrop click, and escape key
 *
 * Usage examples:
 * 1. Home Page:
 *    <SubscribeSheet
 *      isOpen={true}
 *      onClose={() => {}}
 *      message="Subscribe to our newsletter"
 *      hasBottomTabs={true}
 *      persistent={true}
 *    />
 *
 * 2. Book Details Page:
 *    <SubscribeSheet
 *      isOpen={isModalOpen}
 *      onClose={() => setIsModalOpen(false)}
 *      message="Subscribe to access this book"
 *      hasBottomTabs={false}
 *      persistent={false}
 *    />
 */
interface SubscribeSheetProps {
  /**
   * Whether the sheet is open or not
   */
  isOpen: boolean;
  
  /**
   * Function to close the sheet
   */
  onClose: () => void;
  
  /**
   * Message to display in the sheet
   */
  message: string;
  
  /**
   * Price to display in the sheet (optional)
   */
  price?: number;
  
  /**
   * Whether the sheet is persistent (not auto-closable)
   * - Home page: true
   * - Book Details: false
   */
  persistent?: boolean;
  
  /**
   * Whether the component should account for bottom tabs
   * - Home page on small screens: true
   * - Book Details: false
   */
  hasBottomTabs?: boolean;
  
  /**
   * Additional class names
   */
  className?: string;
}

export const SubscribeSheet: FC<SubscribeSheetProps> = ({
  isOpen,
  onClose,
  message,
  price = 9.99,
  persistent = false,
  hasBottomTabs = false,
  className,
}) => {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Handle backdrop click for non-persistent mode (Book Details)
  const handleBackdropClick = () => {
    if (!persistent) {
      onClose();
    }
  };

  // Handle escape key for non-persistent mode (Book Details)
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (!persistent && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen && !persistent) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose, persistent]);

  return (
    <>
      {/* Backdrop for non-persistent mode (Book Details) */}
      {!persistent && (
        <div 
          className="fixed inset-0 bg-black/30 z-30" 
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      
      {/* Position the banner at the bottom but with correct styling */}
      <div
        className={cn(
          // Base styles for all contexts
          "w-full border-t border-gray-200 bg-white shadow-md",
          
          // Positioning classes based on context
          persistent
            ? "fixed bottom-0 left-0 right-0 lg:sticky lg:bottom-0" // Home page - fixed on mobile, sticky on large screens
            : "fixed bottom-0 left-0 right-0", // Book details - fixed on all screens

          // Z-index to ensure proper stacking
          "z-40",

          // Container width matches footer on large screens
          "lg:max-w-screen-xl lg:mx-auto",
          
          // Extra spacing for bottom tabs on small screens (Home page)
          hasBottomTabs && "mb-[64px] lg:mb-0",
          
          // For non-persistent mode (Book Details) on small screens
          !persistent && "rounded-t-lg",
          
          // Animation classes
          "transition-all duration-300",
          
          // Pass any custom class names
          className
        )}
      >
        <div className="relative px-4 py-3">
          {/* Close button (X) in the top right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Main content layout */}
          <div className="flex items-center justify-between">
            {/* Price information on the left */}
            <div className="flex items-center">
              <span className="text-lg font-medium text-orange-500">
                <span className="mr-1 text-sm">₹</span> {price}
              </span>
            </div>
            
            {/* Message in the center */}
            <div className="flex-1 text-center mx-4">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>

            {/* Subscribe button on the right */}
            <Button
              size="sm"
              className="h-9 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium"
              onClick={() => console.log("Subscribe clicked")}
            >
              Subscribe Now!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
