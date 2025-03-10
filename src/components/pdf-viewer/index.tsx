import { useState, useEffect, type FC } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Slider } from "@/components/common/ui/slider";
import { cn } from "@/lib/utils/utils";

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

const PdfViewer: FC<PdfViewerProps> = ({ pdfUrl, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);

  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  // Handle document load error
  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError(error);
    setLoading(false);
  };

  // Navigation functions
  const goToPrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
  };

  // Zoom functions
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  // Rotation function
  const rotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNextPage();
      } else if (e.key === "ArrowLeft") {
        goToPrevPage();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-[90vw] max-w-7xl flex-col overflow-hidden rounded-lg bg-background shadow-xl">
        {/* Header with controls */}
        <div className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">PDF Viewer</span>
            {numPages && (
              <span className="text-sm text-muted-foreground">
                Page {pageNumber} of {numPages}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8" title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={rotate} className="h-8 w-8" title="Rotate">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="relative flex-1 overflow-auto bg-muted/10">
          <div className="flex min-h-full items-center justify-center p-4">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                    <X className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">Failed to load PDF</p>
                    <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                    }}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              className="flex justify-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
                loading={null}
              />
            </Document>
          </div>
        </div>

        {/* Footer with navigation */}
        {numPages && numPages > 1 && (
          <div className="flex h-14 items-center justify-between border-t bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-full max-w-md px-4">
              <Slider
                value={[pageNumber]}
                min={1}
                max={numPages}
                step={1}
                onValueChange={(value) => setPageNumber(value[0])}
                className="cursor-pointer"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
