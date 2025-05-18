
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ElectionBannerCarouselProps {
  bannerUrls: string[];
  title: string;
  autoAdvance?: boolean;
  interval?: number;
}

const ElectionBannerCarousel = ({ 
  bannerUrls, 
  title, 
  autoAdvance = true, 
  interval = 5000 
}: ElectionBannerCarouselProps) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Check if election has banners
  const hasBanners = bannerUrls && bannerUrls.length > 0;
  
  // Get current banner
  const currentBanner = hasBanners ? bannerUrls[currentBannerIndex] : null;

  const handleNextBanner = useCallback(() => {
    if (bannerUrls && bannerUrls.length > 0) {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    }
  }, [bannerUrls]);

  const handlePreviousBanner = () => {
    if (bannerUrls && bannerUrls.length > 0) {
      setCurrentBannerIndex((prev) => 
        prev === 0 ? bannerUrls.length - 1 : prev - 1
      );
    }
  };
  
  // Auto-advance carousel
  useEffect(() => {
    if (autoAdvance && bannerUrls && bannerUrls.length > 1) {
      const timer = setInterval(handleNextBanner, interval);
      return () => clearInterval(timer);
    }
  }, [autoAdvance, bannerUrls, handleNextBanner, interval]);
  
  if (!hasBanners) return null;
  
  return (
    <div className="relative w-full h-[300px] overflow-hidden rounded-lg mb-6">
      {bannerUrls.map((url, index) => (
        <div 
          key={url}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img 
            src={url || "/placeholder.svg"} 
            alt={`${title} banner ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {bannerUrls.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 z-20"
            onClick={handlePreviousBanner}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 z-20"
            onClick={handleNextBanner}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {bannerUrls.map((_, index) => (
              <span 
                key={index} 
                className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
                role="button"
                onClick={() => setCurrentBannerIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionBannerCarousel;
