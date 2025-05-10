
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ElectionBannerCarouselProps {
  bannerUrls: string[];
  title: string;
}

const ElectionBannerCarousel = ({ bannerUrls, title }: ElectionBannerCarouselProps) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Check if election has banners
  const hasBanners = bannerUrls && bannerUrls.length > 0;
  
  // Get current banner
  const currentBanner = hasBanners ? bannerUrls[currentBannerIndex] : null;

  const handleNextBanner = () => {
    if (bannerUrls && bannerUrls.length > 0) {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    }
  };

  const handlePreviousBanner = () => {
    if (bannerUrls && bannerUrls.length > 0) {
      setCurrentBannerIndex((prev) => 
        prev === 0 ? bannerUrls.length - 1 : prev - 1
      );
    }
  };
  
  if (!hasBanners) return null;
  
  console.log("Rendering banner carousel with URLs:", bannerUrls);
  console.log("Current banner index:", currentBannerIndex);
  console.log("Current banner URL:", currentBanner);
  
  return (
    <div className="relative w-full h-[300px] overflow-hidden rounded-lg mb-6">
      <img 
        src={currentBanner || "/placeholder.svg"} 
        alt={`${title} banner`}
        className="w-full h-full object-cover"
      />
      
      {bannerUrls.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90"
            onClick={handlePreviousBanner}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90"
            onClick={handleNextBanner}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {bannerUrls.map((_, index) => (
              <span 
                key={index} 
                className={`block w-2 h-2 rounded-full ${
                  index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
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
