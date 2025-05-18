
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ElectionBannerCarouselProps {
  bannerUrls: string[] | undefined;
  title: string;
}

const ElectionBannerCarousel = ({ bannerUrls, title }: ElectionBannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!bannerUrls || bannerUrls.length === 0) return null;
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? bannerUrls.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerUrls.length);
  };
  
  return (
    <div className="relative w-full h-[300px] overflow-hidden rounded-lg mb-6">
      <img 
        src={bannerUrls[currentIndex]} 
        alt={`${title} banner`}
        className="w-full h-full object-cover"
      />
      
      {bannerUrls.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {bannerUrls.map((_, index) => (
              <span 
                key={index} 
                className={`block w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                role="button"
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionBannerCarousel;
