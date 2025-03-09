import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { cn } from "@/lib/utils/utils";

interface PdfViewerProps {
  pdfSource: string;
  onClose?: () => void;
}

function PdfViewer({ pdfSource, onClose }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-[90vw] max-w-7xl flex-col overflow-hidden rounded-lg bg-background shadow-xl">
        {/* Header with controls */}
        <div className="flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <span className="text-sm">PDF Viewer</span>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* PDF Content */}
        <div className="relative flex-1">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-muted/10">
            <iframe
              src={`${pdfSource}#toolbar=0`}
              className="h-full w-full"
              onLoad={() => setLoading(false)}
              onError={(e) => {
                setError(new Error("Failed to load PDF"));
                setLoading(false);
              }}
            />
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfViewer;
