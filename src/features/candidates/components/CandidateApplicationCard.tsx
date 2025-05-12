
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, CheckCircle, Clock, FileText, Pencil, Trash, X } from "lucide-react";
import { CandidateApplication } from "@/types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import { updateCandidateApplication, deleteCandidateApplication } from "../services/candidateApplicationService";
import { formatDate } from "@/utils/dateUtils";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  isAdmin: boolean;
  onStatusChange?: () => void;
}

const CandidateApplicationCard = ({ application, isAdmin, onStatusChange }: CandidateApplicationCardProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(application.feedback || "");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    try {
      setLoading(newStatus);
      const responseFeedback = feedback || null;
      
      await updateCandidateApplication(application.id, {
        status: newStatus,
        feedback: responseFeedback,
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString()
      });

      toast.success(`Application ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      if (onStatusChange) {
        onStatusChange();
      }
      setShowEditDialog(false);
    } catch (error) {
      console.error(`Error ${newStatus} application:`, error);
      toast.error(`Failed to ${newStatus === "approved" ? "approve" : "reject"} application`);
    } finally {
      setLoading(null);
    }
  };
  
  const handleDelete = async () => {
    try {
      setLoading("deleting");
      
      // Direct database deletion to ensure it works
      const { error } = await supabase
        .from('candidate_applications')
        .delete()
        .eq('id', application.id);
        
      if (error) throw error;
      
      toast.success("Application deleted successfully");
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    } finally {
      setLoading(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const isPending = application.status === "pending";
  const isApproved = application.status === "approved";
  const isRejected = application.status === "rejected";

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg">{application.name}</CardTitle>
            <ApplicationStatusBadge status={application.status as 'pending' | 'approved' | 'rejected'} />
          </div>
          <CardDescription>
            Position: {application.position}
          </CardDescription>
          {application.image_url && (
            <div className="mt-3 w-full h-40 relative">
              <img 
                src={application.image_url} 
                alt={`${application.name}`} 
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="py-2 flex-grow">
          <div className="space-y-2 text-sm">
            {application.bio && (
              <div>
                <p className="font-medium">Bio:</p>
                <p className="text-muted-foreground whitespace-pre-line">{application.bio}</p>
              </div>
            )}
            
            {application.feedback && (
              <div className="mt-4">
                <p className="font-medium">Feedback:</p>
                <p className="text-muted-foreground whitespace-pre-line">{application.feedback}</p>
              </div>
            )}
            
            <div className="mt-4 space-y-1">
              <p className="text-xs text-muted-foreground">
                Submitted on {formatDate(application.created_at || '')}
              </p>
              {application.reviewed_by && application.reviewed_at && (
                <p className="text-xs text-muted-foreground">
                  {application.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDate(application.reviewed_at)}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        {isAdmin && (
          <CardFooter className="flex flex-wrap gap-2">
            {isPending && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                  onClick={() => setShowEditDialog(true)}
                  disabled={!!loading}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </>
            )}
            
            {!isPending && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditDialog(true)}
                disabled={!!loading}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit Response
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!!loading}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isPending ? "Review Application" : "Edit Application Response"}
            </DialogTitle>
            <DialogDescription>
              {isPending 
                ? "Provide feedback and approve or reject the application" 
                : `Edit your response to ${application.name}'s application`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Textarea 
                id="feedback" 
                placeholder="Provide feedback to the applicant..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            {isPending ? (
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={!!loading}
                >
                  {loading === "rejected" ? (
                    <span className="animate-spin mr-1">...</span>
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Reject
                </Button>
                
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange("approved")}
                  disabled={!!loading}
                >
                  {loading === "approved" ? (
                    <span className="animate-spin mr-1">...</span>
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => handleStatusChange(application.status as "approved" | "rejected")}
                disabled={!!loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading === "deleting"}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading === "deleting"}
            >
              {loading === "deleting" ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CandidateApplicationCard;
