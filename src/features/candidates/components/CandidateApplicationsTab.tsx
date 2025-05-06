
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { CandidateApplication, getElectionApplications, updateApplicationStatus } from "../services/candidateApplicationService";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

interface CandidateApplicationsTabProps {
  electionId: string;
  isAdmin: boolean;
}

const CandidateApplicationsTab = ({ electionId, isAdmin }: CandidateApplicationsTabProps) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<CandidateApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (electionId) {
      fetchApplications();
    }
  }, [electionId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getElectionApplications(electionId);
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load candidate applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (application: CandidateApplication) => {
    setSelectedApplication(application);
    setActionType('approve');
    setFeedback("");
    setIsDialogOpen(true);
  };

  const handleReject = (application: CandidateApplication) => {
    setSelectedApplication(application);
    setActionType('reject');
    setFeedback("");
    setIsDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedApplication) return;
    
    try {
      setActionLoading(true);
      
      await updateApplicationStatus(
        selectedApplication.id, 
        actionType, 
        feedback || undefined
      );
      
      toast.success(
        actionType === 'approve' 
          ? "Candidate application approved successfully" 
          : "Candidate application rejected"
      );
      
      setIsDialogOpen(false);
      await fetchApplications();
    } catch (error) {
      console.error(`Error ${actionType}ing application:`, error);
      toast.error(`Failed to ${actionType} application`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-[#008f50] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-12 border rounded-md">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No candidate applications</h3>
        <p className="text-muted-foreground">
          There are no pending applications for this election.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {applications.map(application => (
          <Card key={application.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{application.name}</CardTitle>
                  <CardDescription className="text-base font-medium mt-1">
                    {application.position}
                  </CardDescription>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </div>
            </CardHeader>
            
            <CardContent className="py-2">
              {application.image_url && (
                <div className="w-full h-40 mb-4 rounded-md overflow-hidden">
                  <img 
                    src={application.image_url} 
                    alt={application.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2 mb-3">
                {application.student_id && (
                  <div className="text-sm">
                    <span className="font-medium">Student ID:</span> {application.student_id}
                  </div>
                )}
                {application.department && (
                  <div className="text-sm">
                    <span className="font-medium">Department:</span> {application.department}
                  </div>
                )}
                {application.year_level && (
                  <div className="text-sm">
                    <span className="font-medium">Year Level:</span> {application.year_level}
                  </div>
                )}
              </div>
              
              <div className="text-sm mb-2 font-medium">Bio:</div>
              <p className="text-sm text-muted-foreground line-clamp-4">{application.bio}</p>
              
              {application.feedback && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <div className="font-medium mb-1">Feedback:</div>
                  <p className="text-muted-foreground">{application.feedback}</p>
                </div>
              )}
            </CardContent>
            
            {isAdmin && application.status === 'pending' && (
              <CardFooter className="flex justify-end gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleReject(application)}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  onClick={() => handleApprove(application)}
                  className="bg-[#008f50] hover:bg-[#007a45]"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'The candidate will be added to the election.'
                : 'The candidate will be notified that their application was rejected.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="feedback" className="text-sm font-medium block mb-2">
              {actionType === 'approve' ? 'Add a comment (optional)' : 'Provide feedback on rejection (recommended)'}
            </label>
            <Textarea
              id="feedback"
              placeholder={actionType === 'approve' 
                ? "Add any comments for the candidate..." 
                : "Help the candidate understand why their application was rejected..."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={actionLoading}
              className={actionType === 'approve' ? "bg-[#008f50] hover:bg-[#007a45]" : "bg-destructive hover:bg-destructive/90"}
            >
              {actionLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                  {actionType === 'approve' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : (
                actionType === 'approve' ? 'Approve Application' : 'Reject Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateApplicationsTab;
