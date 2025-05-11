
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Election } from "@/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { Button } from "@/components/ui/button";

import ElectionBannerCarousel from "./ElectionBannerCarousel";
import ElectionTitleSection from "./ElectionTitleSection";
import ElectionMetadataGrid from "./ElectionMetadataGrid";
import CandidacyAlert from "./CandidacyAlert";
import { useCandidacyPeriod } from "./useCandidacyPeriod";

interface ElectionDetailsHeaderProps {
  election: Election | null;
  loading: boolean;
  userHasApplied?: boolean;
  isUserEligible?: boolean;
  onApplicationSubmitted?: () => void;
  onOpenDialog?: () => void; // Add this prop to handle dialog opening from parent
}

const ElectionDetailsHeader = ({ 
  election, 
  loading,
  userHasApplied = false,
  isUserEligible = true,
  onApplicationSubmitted,
  onOpenDialog
}: ElectionDetailsHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();

  const { isCandidacyPeriodActive } = useCandidacyPeriod(election);

  const handleApplyAsCandidate = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!isUserEligible) {
      return;
    }
    
    // Call the parent's dialog opener instead of managing our own dialog state
    if (onOpenDialog) {
      onOpenDialog();
    }
  };

  if (!election || loading) return null;
  
  const canApplyAsCandidate = isCandidacyPeriodActive && !userHasApplied && isUserEligible && !isAdmin;
  
  return (
    <div className="space-y-4">
      {election.banner_urls && election.banner_urls.length > 0 && (
        <ElectionBannerCarousel 
          bannerUrls={election.banner_urls} 
          title={election.title}
          autoAdvance={true}
          interval={5000}
        />
      )}

      <ElectionTitleSection 
        title={election.title}
        description={election.description}
        isCandidacyPeriodActive={isCandidacyPeriodActive}
        isAdmin={isAdmin}
        userHasApplied={userHasApplied}
        canApply={isUserEligible}
        onApply={handleApplyAsCandidate}
      />
      
      <ElectionMetadataGrid 
        election={election} 
        isCandidacyPeriodActive={isCandidacyPeriodActive} 
      />
      
      {isCandidacyPeriodActive && election.candidacyStartDate && election.candidacyEndDate && (
        <CandidacyAlert 
          isActive={isCandidacyPeriodActive}
          startDate={election.candidacyStartDate}
          endDate={election.candidacyEndDate}
        />
      )}
      
      <Separator />
    </div>
  );
};

export default ElectionDetailsHeader;
