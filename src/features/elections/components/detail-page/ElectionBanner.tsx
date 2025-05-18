
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElectionBannerProps {
  bannerUrls?: string[];
  title: string;
}

const ElectionBanner: React.FC<ElectionBannerProps> = ({ bannerUrls, title }) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  if (!bannerUrls || bannerUrls.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentBanner((prev) => (prev === 0 ? bannerUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentBanner((prev) => (prev === bannerUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg my-6 h-[300px] md:h-[400px]">
      {/* Banner images */}
      {bannerUrls.map((url, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 h-full w-full transition-all duration-500 ease-in-out",
            index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={url}
            alt={`${title} banner ${index + 1}`}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ))}

      {/* Navigation buttons */}
      {bannerUrls.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 focus:outline-none"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
            {bannerUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentBanner ? "bg-white scale-125" : "bg-white/50"
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ElectionBanner;
