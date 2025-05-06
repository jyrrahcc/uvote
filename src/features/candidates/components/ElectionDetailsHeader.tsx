
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { Election } from "@/types";
import { format } from "date-fns";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import CandidateApplicationForm from "./CandidateApplicationForm";
import { toast } from "sonner";

interface ElectionDetailsHeaderProps {
  election: Election | null;
  loading: boolean;
}

const ElectionDetailsHeader = ({ election, loading }: ElectionDetailsHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [userHasApplied, setUserHasApplied] = useState(false);

  // Check if candidacy period is active
  const isCandidacyPeriodActive = () => {
    if (!election?.candidacyStartDate || !election?.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  const handleApplyAsCandidate = () => {
    if (!user) {
      toast.error("Please log in to apply as a candidate");
      // Redirect to login
      navigate("/login");
      return;
    }
    
    setApplicationFormOpen(true);
  };

  const handleApplicationSubmitted = () => {
    setApplicationFormOpen(false);
    setUserHasApplied(true);
    toast.success("Your application has been submitted for review");
  };

  if (!election || loading) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{election.title}</h1>
          <p className="text-muted-foreground">{election.description}</p>
        </div>
        
        {!isAdmin && isCandidacyPeriodActive() && !userHasApplied && (
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
            <p className="text-sm text-muted-foreground">{election.department || "University-wide"}</p>
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
