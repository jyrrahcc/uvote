
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Election } from "@/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { toast } from "sonner";

import ElectionBannerCarousel from "./ElectionBannerCarousel";
import ElectionTitleSection from "./ElectionTitleSection";
import ElectionMetadataGrid from "./ElectionMetadataGrid";
import CandidacyAlert from "./CandidacyAlert";
import CandidateApplicationForm from "../CandidateApplicationForm";
import { useCandidacyPeriod } from "./useCandidacyPeriod";

interface ElectionDetailsHeaderProps {
  election: Election | null;
  loading: boolean;
  userHasApplied?: boolean;
  isUserEligible?: boolean;
  onApplicationSubmitted?: () => void;
}

const ElectionDetailsHeader = ({ 
  election, 
  loading,
  userHasApplied = false,
  isUserEligible = true,
  onApplicationSubmitted
}: ElectionDetailsHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);

  const { isCandidacyPeriodActive } = useCandidacyPeriod(election);

  const handleApplyAsCandidate = () => {
    if (!user) {
      toast.error("Please log in to apply as a candidate");
      navigate("/login");
      return;
    }
    
    if (!isUserEligible) {
      toast.error("You are not eligible to apply for this election");
      return;
    }
    
    setApplicationFormOpen(true);
  };

  const handleApplicationSubmitted = () => {
    setApplicationFormOpen(false);
    toast.success("Your application has been submitted for review");
    
    // Call the parent's onApplicationSubmitted if provided
    if (onApplicationSubmitted) {
      onApplicationSubmitted();
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
      
      {/* Application Form Dialog */}
      <Dialog open={applicationFormOpen} onOpenChange={setApplicationFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply as Candidate</DialogTitle>
            <DialogDescription>
              Fill in the required information to apply as a candidate for {election.title}
            </DialogDescription>
          </DialogHeader>
          
          {election.id && (
            <CandidateApplicationForm 
              electionId={election.id} 
              userId={user?.id || ''}
              open={applicationFormOpen}
              onClose={() => setApplicationFormOpen(false)}
              onApplicationSubmitted={handleApplicationSubmitted}
              onCancel={() => setApplicationFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectionDetailsHeader;
