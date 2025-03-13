import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { FC, useEffect, useState, useRef } from "react";
import { X, Loader2, ZoomIn, ZoomOut } from "@/assets/icons";
import { Button } from "@/components/common/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import { useResizeObserver } from "@/lib/hooks/use-resize-observer";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
  title?: string;
  isOpen: boolean;
}

const PdfViewer: FC<PdfViewerProps> = ({ pdfUrl, onClose, title, isOpen }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef: any = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver(containerRef);

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
      e.preventDefault();
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

  // Track current page on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLoading) return;

    const handleScroll = () => {
      requestAnimationFrame(() => {
        const pages = Array.from(container.getElementsByClassName("pdf-page")) as HTMLElement[];
        if (pages.length === 0) return;

        const containerRect = container.getBoundingClientRect();
        const containerTop = containerRect.top;

        // Find the first page that's mostly visible in the viewport
        for (let i = 0; i < pages.length; i++) {
          const rect = pages[i].getBoundingClientRect();
          const relativeTop = rect.top - containerTop;
          const visibleHeight = Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top);

          if (visibleHeight > rect.height * 0.3) {
            // Page is at least 30% visible
            setCurrentPage(i + 1);
            break;
          }
        }
      });
    };

    // Wait a bit for the PDF to render properly
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [numPages, isLoading]);

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setCurrentPage(1); // Reset to first page
    setIsLoading(false);
  }

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
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Page {currentPage} of {numPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
              disabled={scale >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="flex-1 min-h-0 relative bg-background overflow-y-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
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
          <div className="w-full flex flex-col items-center" style={{ minHeight: "calc(100vh - 8rem)" }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onLoadSuccess}
              loading={<></>}
              error={<></>}
              className="flex flex-col items-center py-6 w-full"
              renderMode="canvas"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="mb-8 shadow-lg pdf-page"
                  style={{
                    marginBottom: index === numPages - 1 ? "calc(100vh - 12rem)" : "2rem",
                  }}
                >
                  <Page pageNumber={index + 1} width={Math.max(width * 0.9, 320)} scale={scale} className="bg-white" />
                </div>
              ))}
            </Document>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
