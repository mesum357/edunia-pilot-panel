import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { toAbsoluteUrl } from '@/lib/api';

interface ImageModalProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageModal({ images, open, onOpenChange }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Normalize image URLs to ensure Cloudinary URLs are used
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    
    // If already a Cloudinary URL or absolute URL, use it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it contains Cloudinary domain but missing protocol
    if (url.includes('res.cloudinary.com') || url.includes('cloudinary.com')) {
      return url.startsWith('//') ? `https:${url}` : `https://${url}`;
    }
    
    // For local files, convert to absolute URL (fallback for old uploads)
    const path = url.includes('/') ? url : `/uploads/${url}`;
    return toAbsoluteUrl(path) || url;
  };

  const normalizedImages = images.map(normalizeImageUrl).filter(Boolean);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <div className="relative w-full h-full flex flex-col bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-white text-sm">
              {currentIndex + 1} / {normalizedImages.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
            {normalizedImages[currentIndex] ? (
              <img
                src={normalizedImages[currentIndex]}
                alt={`Document ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
                onError={(e) => {
                  // If image fails to load, log error
                  const target = e.target as HTMLImageElement;
                  console.error('Failed to load image:', target.src);
                }}
              />
            ) : (
              <div className="text-white text-center">
                <p>Image not available</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          {normalizedImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Thumbnails */}
          {normalizedImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-2 justify-center">
                {normalizedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                    }}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      index === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If thumbnail fails to load, hide it
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
