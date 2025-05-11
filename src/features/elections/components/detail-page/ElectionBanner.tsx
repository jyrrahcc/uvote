
import React from "react";

interface ElectionBannerProps {
  bannerUrls?: string[];
  title: string;
}

const ElectionBanner: React.FC<ElectionBannerProps> = ({ bannerUrls, title }) => {
  if (!bannerUrls || bannerUrls.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg">
      <img 
        src={bannerUrls[0]} 
        alt={title}
        className="w-full h-48 md:h-64 object-cover"
      />
    </div>
  );
};

export default ElectionBanner;
