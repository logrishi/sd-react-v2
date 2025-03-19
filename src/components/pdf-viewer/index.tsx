import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { FC, useEffect, useState, useRef } from "react";
import { X, Loader2, ZoomIn, ZoomOut } from "@/assets/icons";
import { Button } from "@/components/common/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";
import { useResizeObserver } from "@/lib/hooks/useResizeObserver";

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
  const [contentWidth, setContentWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  };

  // Handle touch events for pinch zoom
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Prevent default to avoid browser's native zoom
      e.preventDefault();
      e.stopPropagation();
      
      const distance = getTouchDistance(e.touches);
      if (distance) {
        setTouchDistance(distance);
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && touchDistance) {
      // Prevent default to avoid browser's native zoom
      e.preventDefault();
      e.stopPropagation();
      
      const newDistance = getTouchDistance(e.touches);
      if (newDistance) {
        // Calculate scale difference
        const scaleDiff = (newDistance - touchDistance) * 0.01; // Increased sensitivity
        
        // Update scale with limits
        setScale((prev) => {
          const newScale = Math.min(5, Math.max(0.5, prev + scaleDiff)); // Increased max zoom to 500%
          
          // Calculate new content width based on scale
          const newContentWidth = Math.max(width, 320) * newScale * 1.2; // Add 20% extra space
          setContentWidth(newContentWidth);
          
          return newScale;
        });
        
        // Update touch distance for next calculation
        setTouchDistance(newDistance);
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };
  const containerRef: any = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver(containerRef);

  // Reset loading state when PDF URL changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setContentWidth(0);
    }
  }, [pdfUrl, isOpen]);
  
  // Update content width when scale changes
  useEffect(() => {
    if (scale > 1) {
      setContentWidth(Math.max(width, 320) * scale * 1.2); // Add 20% extra space
    } else {
      setContentWidth(0); // Reset when at normal scale
    }
  }, [scale, width]);

  // Cleanup on unmount or dialog close
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
    }
  }, [isOpen]);

  // Prevent right-click on iframe and setup touch handlers
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const container = containerRef.current;
    if (container) {
      // Use capture phase to ensure our handlers run first
      container.addEventListener("touchstart", handleTouchStart as any, { passive: false, capture: true });
      container.addEventListener("touchmove", handleTouchMove as any, { passive: false, capture: true });
      container.addEventListener("touchend", handleTouchEnd, { capture: true });
    }

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart as any, { capture: true });
        container.removeEventListener("touchmove", handleTouchMove as any, { capture: true });
        container.removeEventListener("touchend", handleTouchEnd, { capture: true });
      }
    };
  }, [isOpen]); // Changed dependency to isOpen instead of touchDistance

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

  // Handle viewport meta tag
  useEffect(() => {
    if (!isOpen) return;
    
    // Force viewport to allow zooming
    const setViewportMeta = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        // Store original content for restoration
        const originalContent = viewportMeta.getAttribute('content') || '';
        // Set user-scalable=yes
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        
        // Return cleanup function
        return () => {
          if (viewportMeta) {
            viewportMeta.setAttribute('content', originalContent);
          }
        };
      } else {
        // If no viewport meta exists, create one
        const newViewportMeta = document.createElement('meta');
        newViewportMeta.setAttribute('name', 'viewport');
        newViewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        newViewportMeta.setAttribute('id', 'pdf-viewer-viewport');
        document.head.appendChild(newViewportMeta);
        
        // Return cleanup function
        return () => {
          if (document.getElementById('pdf-viewer-viewport')) {
            document.getElementById('pdf-viewer-viewport')?.remove();
          }
        };
      }
    };
    
    // Set viewport meta and get cleanup function
    const cleanup = setViewportMeta();
    
    return cleanup;
  }, [isOpen]);

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
      <DialogContent variant="fullscreen" className="flex flex-col overflow-hidden select-none" style={{ overscrollBehavior: 'none' }}>
        <DialogTitle></DialogTitle>
        <div
          className="flex items-center justify-between h-12 px-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-[100] flex-shrink-0 select-none fixed w-full"
          tabIndex={-1}
        >
          <h2 className="text-sm font-medium truncate">{title || "PDF Viewer"}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40 fixed w-full top-12 z-[99]">
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
              onClick={() => {
                setScale((prev) => Math.max(0.5, prev - 0.1));
                // Reset content width when zooming out to minimum
                if (scale <= 0.6) setContentWidth(0);
              }}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setScale((prev) => Math.min(5, prev + 0.1))}
              disabled={scale >= 5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="flex-1 min-h-0 relative bg-background overflow-auto overscroll-none"
          style={{ 
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",
            overflowX: scale > 1 ? "scroll" : "hidden", // Force horizontal scroll when zoomed
            overflowY: "scroll",
            overscrollBehavior: "contain",
            touchAction: "pan-x pan-y",
            paddingTop: "6rem", // Increased padding for fixed headers
          }}
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
          <div 
            className="h-full relative" 
            style={{
              width: contentWidth > 0 ? `${contentWidth}px` : "100%", // Dynamic width based on zoom level
              minWidth: "100%",
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-x pan-y',
              margin: '0 auto',
              paddingBottom: "4rem", // Add bottom padding for better scrolling
              paddingTop: "1rem",
            }}>
            <div 
              className="flex flex-col items-center w-full h-full px-6" 
              style={{ 
                minHeight: "calc(100vh - 8rem)",
                position: "relative",
                left: scale > 1 ? "50%" : 0,
                transform: scale > 1 ? "translateX(-50%)" : "none",
                paddingTop: "1rem",
                paddingBottom: "4rem",
              }}>
              <Document
                file={pdfUrl}
                onLoadSuccess={onLoadSuccess}
                loading={<></>}
                error={<></>}
                className="py-6"
                renderMode="canvas"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className="mb-8 shadow-lg pdf-page"
                    style={{
                      marginBottom: index === numPages - 1 ? "calc(100vh - 12rem)" : "2rem",
                      width: contentWidth > 0 ? `${contentWidth * 0.8}px` : `${Math.max(width * 0.9, 320) * scale}px`,
                      maxWidth: "100%",
                      transition: "width 0.1s ease-out", // Smooth zoom transitions
                      margin: "0 auto",
                    }}
                  >
                    <Page
                      pageNumber={index + 1}
                      width={Math.max(width * 0.9, 320)}
                      scale={scale}
                      className="bg-white"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </div>
                ))}
              </Document>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
