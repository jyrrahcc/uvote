import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Calendar, CheckCircle, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Election } from "@/types";
import { format } from "date-fns";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import CandidateApplicationForm from "../CandidateApplicationForm";
import { toast } from "sonner";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

interface ElectionDetailsHeaderProps {
  election: Election | null;
  loading: boolean;
  userHasApplied: boolean;
  isUserEligible: boolean;
  onOpenDialog: () => void;
  onApplicationSubmitted: () => void;
}

const ElectionDetailsHeader = ({ 
  election, 
  loading, 
  userHasApplied,
  isUserEligible,
  onOpenDialog,
  onApplicationSubmitted 
}: ElectionDetailsHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isVoter } = useRole();
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);

  // Check if candidacy period is active
  const isCandidacyPeriodActive = () => {
    if (!election?.candidacyStartDate || !election?.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };
  
  // Check user eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !election) return;
      
      try {
        const { isEligible, reason } = await checkUserEligibility(user.id, election);
        if (!isEligible) {
          setEligibilityReason(reason);
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
      }
    };
    
    if (!isUserEligible) {
      checkEligibility();
    }
  }, [user, election, isUserEligible]);

  const handleApplyAsCandidate = () => {
    if (!user) {
      toast.error("Please log in to apply as a candidate");
      // Redirect to login
      navigate("/login");
      return;
    }
    
    if (!isVoter) {
      toast.error("You must be a verified voter to apply as a candidate");
      return;
    }
    
    if (!isUserEligible) {
      toast.error(eligibilityReason || "You are not eligible to apply as a candidate for this election");
      return;
    }
    
    if (onOpenDialog) {
      onOpenDialog();
    } else {
      setApplicationFormOpen(true);
    }
  };

  const handleApplicationSubmitted = () => {
    setApplicationFormOpen(false);
    
    if (onApplicationSubmitted) {
      onApplicationSubmitted();
    } else {
      toast.success("Your application has been submitted for review");
    }
  };

  const handleNextBanner = () => {
    if (election?.banner_urls && election.banner_urls.length > 0) {
      setCurrentBannerIndex((prev) => (prev + 1) % election.banner_urls.length);
    }
  };

  const handlePreviousBanner = () => {
    if (election?.banner_urls && election.banner_urls.length > 0) {
      setCurrentBannerIndex((prev) => 
        prev === 0 ? election.banner_urls.length - 1 : prev - 1
      );
    }
  };

  if (!election || loading) return null;
  
  // Check if election has banners
  const hasBanners = election.banner_urls && election.banner_urls.length > 0;
  // Get current banner
  const currentBanner = hasBanners ? election.banner_urls[currentBannerIndex] : null;
  
  return (
    <div className="space-y-4">
      {/* Banners carousel */}
      {hasBanners && (
        <div className="relative w-full h-[300px] overflow-hidden rounded-lg mb-6">
          <img 
            src={currentBanner || "/placeholder.svg"} 
            alt={`${election.title} banner`}
            className="w-full h-full object-cover"
          />
          
          {election.banner_urls.length > 1 && (
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
                {election.banner_urls.map((_, index) => (
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
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{election.title}</h1>
          <p className="text-muted-foreground">{election.description}</p>
        </div>
        
        {!isAdmin && isCandidacyPeriodActive() && !userHasApplied && isVoter && isUserEligible && (
          <Button 
            className="mt-4 md:mt-0 bg-[#008f50] hover:bg-[#007a45]"
            onClick={handleApplyAsCandidate}
          >
            Apply as Candidate
          </Button>
        )}
        
        {!isAdmin && userHasApplied && (
          <div className="flex items-center mt-4 md:mt-0 text-emerald-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Application submitted</span>
          </div>
        )}
        
        {isAdmin && (
          <Button
            variant="outline"
            className="mt-4 md:mt-0"
            onClick={() => navigate(`/admin/elections`)}
          >
            Manage Elections
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-[#008f50]" />
          <div>
            <p className="text-sm font-medium">Voting Period</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(election.startDate), 'MMM d, yyyy')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-[#008f50]" />
          <div>
            <p className="text-sm font-medium">Status</p>
            <div className={`text-sm ${
              election.status === 'active' ? 'text-green-600' : 
              election.status === 'upcoming' ? 'text-blue-600' : 
              'text-gray-600'
            } capitalize`}>
              {election.status}
              {isCandidacyPeriodActive() && election.status === 'upcoming' && (
                <span className="ml-2 text-amber-600">(Candidacy Open)</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-[#008f50]" />
          <div>
            <p className="text-sm font-medium">Department</p>
            <p className="text-sm text-muted-foreground">
              {election.colleges && election.colleges.length > 0 
                ? election.colleges.join(', ') 
                : election.department || "University-wide"}
            </p>
          </div>
        </div>
      </div>
      
      {isCandidacyPeriodActive() && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Candidacy period is open</p>
            <p className="text-sm text-amber-700">
              Apply as a candidate from {format(new Date(election.candidacyStartDate!), 'MMM d, yyyy')} to {format(new Date(election.candidacyEndDate!), 'MMM d, yyyy')}
            </p>
            {!isVoter && (
              <p className="text-sm text-amber-700 mt-1 font-medium">
                Note: You must be a verified voter to apply as a candidate.
              </p>
            )}
            {!isUserEligible && isVoter && (
              <p className="text-sm text-amber-700 mt-1 font-medium">
                Note: {eligibilityReason || "You are not eligible to apply for this election based on department or year level requirements."}
              </p>
            )}
          </div>
        </div>
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
              isUserEligible={isUserEligible}
              eligibilityReason={eligibilityReason}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectionDetailsHeader;
