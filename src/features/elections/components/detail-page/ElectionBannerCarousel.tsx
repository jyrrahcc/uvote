
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElectionBannerCarouselProps {
  bannerUrls: string[];
  title: string;
  autoAdvance?: boolean;
  interval?: number;
  height?: string;
}

const ElectionBannerCarousel = ({ 
  bannerUrls, 
  title, 
  autoAdvance = true, 
  interval = 5000,
  height = "h-[300px] md:h-[400px]"
}: ElectionBannerCarouselProps) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoAdvance);
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if election has banners
  const hasBanners = bannerUrls && bannerUrls.length > 0;
  
  const handleNextBanner = useCallback(() => {
    if (bannerUrls && bannerUrls.length > 0) {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    }
  }, [bannerUrls]);

  const handlePreviousBanner = useCallback(() => {
    if (bannerUrls && bannerUrls.length > 0) {
      setCurrentBannerIndex((prev) => 
        prev === 0 ? bannerUrls.length - 1 : prev - 1
      );
    }
  }, [bannerUrls]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentBannerIndex(index);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Auto-advance carousel
  useEffect(() => {
    if (isPlaying && bannerUrls && bannerUrls.length > 1 && !isHovered) {
      const timer = setInterval(handleNextBanner, interval);
      return () => clearInterval(timer);
    }
  }, [isPlaying, bannerUrls, handleNextBanner, interval, isHovered]);
  
  if (!hasBanners) return null;
  
  return (
    <div 
      className={cn("relative w-full overflow-hidden rounded-lg my-6", height)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner images */}
      {bannerUrls.map((url, index) => (
        <div 
          key={index}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            index === currentBannerIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img 
            src={url} 
            alt={`${title} banner ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      ))}
      
      {/* Navigation controls - only show if multiple banners */}
      {bannerUrls.length > 1 && (
        <>
          {/* Previous button */}
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 z-20 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-60"
            )}
            onClick={handlePreviousBanner}
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {/* Next button */}
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 z-20 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-60"
            )}
            onClick={handleNextBanner}
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Play/Pause button */}
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "absolute top-4 right-4 bg-white/80 hover:bg-white/90 z-20 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-60"
            )}
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          {/* Indicator dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {bannerUrls.map((_, index) => (
              <button 
                key={index} 
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 hover:scale-110",
                  index === currentBannerIndex 
                    ? "bg-white shadow-lg scale-110" 
                    : "bg-white/60 hover:bg-white/80"
                )}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>

          {/* Banner counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
            {currentBannerIndex + 1} / {bannerUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionBannerCarousel;
