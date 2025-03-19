import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";
import { X } from "@/assets/icons";

const toastVariants = cva(
  "fixed z-40 flex items-center justify-between rounded-lg border p-2 px-4 shadow-md transition-all duration-300 ease-in-out max-w-[90%] md:max-w-[500px] whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 bg-destructive/20 text-destructive",
        success: "border-success/50 bg-success/20 text-success",
      },
      position: {
        topCenter: "top-16 left-1/2 -translate-x-1/2 fixed", /* Position below header (14px height + padding) */
        topRight: "top-16 right-4 fixed",
        bottomRight: "bottom-4 right-4 fixed",
        bottomCenter: "bottom-4 left-1/2 -translate-x-1/2 fixed",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "topCenter",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, position, children, onClose, autoClose = true, autoCloseDelay = 3000, ...props }, ref) => {
    React.useEffect(() => {
      if (autoClose && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }, [autoClose, autoCloseDelay, onClose]);

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, position }), className)}
        {...props}
      >
        <div className="mr-4 truncate">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted/50 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = "Toast";

export { Toast, toastVariants };
