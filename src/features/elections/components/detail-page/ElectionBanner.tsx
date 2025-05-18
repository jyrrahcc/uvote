
import React from "react";
import ElectionBannerCarousel from "@/features/candidates/components/election-header/ElectionBannerCarousel";

interface ElectionBannerProps {
  bannerUrls?: string[];
  title: string;
}

const ElectionBanner: React.FC<ElectionBannerProps> = ({ bannerUrls, title }) => {
  if (!bannerUrls || bannerUrls.length === 0) {
    return null;
  }

  return <ElectionBannerCarousel bannerUrls={bannerUrls} title={title} />;
};

export default ElectionBanner;
