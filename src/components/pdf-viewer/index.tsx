import { type FC, useEffect, useState } from "react";
import { X, Loader2 } from "@/assets/icons";
import { Button } from "@/components/common/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/ui/dialog";

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
  title?: string;
  isOpen: boolean;
}

const PdfViewer: FC<PdfViewerProps> = ({ pdfUrl, onClose, title, isOpen }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when PDF URL changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [pdfUrl, isOpen]);

  // Cleanup on unmount or dialog close
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);
  // Prevent right-click on iframe
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Handle keyboard shortcuts that might enable saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog
      open={isOpen}
      modal
      onOpenChange={(open: boolean) => {
        if (!open) {
          setIsLoading(true);
          document.body.focus();
          onClose();
        }
      }}
    >
      <DialogContent variant="fullscreen" className="flex flex-col overflow-hidden select-none">
        <DialogTitle></DialogTitle>
        <div
          className="flex items-center justify-between h-12 px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-[100] flex-shrink-0 select-none"
          tabIndex={-1}
        >
          <h2 className="text-sm font-medium truncate">{title || "PDF Viewer"}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 relative bg-background" onContextMenu={(e) => e.preventDefault()}>
          {isLoading && (
            <div className="absolute inset-0 z-[90] flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-4 select-none">
                <div className="relative">
                  <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/10"></div>
                  <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/5"></div>
                  <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading PDF...</p>
              </div>
            </div>
          )}
          <iframe
            src={`${pdfUrl}#toolbar=0&view=FitH&scrollbar=0&embedded=true&navpanes=0&print-hide=true&download=false`}
            className="absolute inset-0 w-full h-full"
            style={{
              border: "none",
              backgroundColor: "white",
              pointerEvents: "auto",
              visibility: isLoading ? "hidden" : "visible",
            }}
            onLoad={() => setIsLoading(false)}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
