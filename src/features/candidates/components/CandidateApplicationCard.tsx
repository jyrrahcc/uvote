
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CandidateApplication } from "@/types";
import { updateCandidateApplication } from "../services/candidateApplicationService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import { Textarea } from "@/components/ui/textarea";
import ImageThumbnail from "./ImageThumbnail";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, Trash2, User, GraduationCap, Building } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  isAdmin: boolean;
  onStatusChange: () => void;
  onDelete?: (applicationId: string) => void;
}

const CandidateApplicationCard = ({ 
  application, 
  isAdmin, 
  onStatusChange,
  onDelete
}: CandidateApplicationCardProps) => {
  const [feedback, setFeedback] = useState(application.feedback || "");
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [statusToSet, setStatusToSet] = useState<"approved" | "rejected" | "disqualified" | null>(null);
  const { user } = useAuth();

  const handleStatusChange = async (status: "approved" | "rejected" | "disqualified") => {
    if ((status === "rejected" || status === "disqualified") && !feedback.trim()) {
      toast.error("Feedback is required when rejecting or disqualifying an application");
      return;
    }

    try {
      setSubmitting(true);
      await updateCandidateApplication(application.id, {
        status,
        feedback: feedback || null,
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString()
      });
      toast.success(`Application ${status}`);
      onStatusChange();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    } finally {
      setSubmitting(false);
      setIsStatusChangeDialogOpen(false);
      setStatusToSet(null);
    }
  };

  const confirmStatusChange = (status: "approved" | "rejected" | "disqualified") => {
    setStatusToSet(status);
    setIsStatusChangeDialogOpen(true);
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(application.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{application.name}</CardTitle>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <div className="text-sm text-gray-500">Position: {application.position}</div>
      </CardHeader>
      <CardContent className="flex-grow">
        {application.image_url && (
          <div className="mb-4">
            <ImageThumbnail 
              imageUrl={application.image_url}
              onRemove={() => {/* No action needed for preview */}}
              disabled={true}
            />
          </div>
        )}
        
        <div className="space-y-3 mb-4">
          {application.department && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{application.department}</span>
            </div>
          )}
          
          {application.year_level && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>{application.year_level}</span>
            </div>
          )}
        </div>
        
        {application.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Bio:</h4>
            <p className="text-sm">{application.bio}</p>
          </div>
        )}

        {/* Review information */}
        {(application.status !== "pending" && application.reviewed_at) && (
          <div className="mt-4 p-2 border rounded-md bg-gray-50 text-xs">
            <div className="flex items-center gap-1 mb-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> 
              <span>Reviewed on {formatDate(application.reviewed_at)}</span>
            </div>
            {application.reviewed_by && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3 w-3" /> 
                <span>Reviewed by admin</span>
              </div>
            )}
          </div>
        )}

        {isAdmin && application.status === "pending" && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Feedback (required for rejection/disqualification):</h4>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the candidate"
              className="h-20"
            />
          </div>
        )}

        {application.feedback && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Feedback:</h4>
            <p className="text-sm bg-gray-50 p-2 rounded">{application.feedback}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isAdmin && (
          <>
            {application.status === "pending" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => confirmStatusChange("rejected")}
                  disabled={submitting}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => confirmStatusChange("disqualified")}
                  disabled={submitting}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Disqualify
                </Button>
                <Button 
                  onClick={() => confirmStatusChange("approved")}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </>
            )}
            
            {application.status !== "pending" && (
              <Button 
                variant="outline" 
                onClick={() => confirmStatusChange("pending")}
                disabled={submitting}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Revert to Pending
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
              {application.status === 'approved' && (
                <p className="text-red-500 mt-2">
                  This will also remove the candidate from the election.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusChangeDialogOpen} onOpenChange={setIsStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {statusToSet?.charAt(0).toUpperCase() + statusToSet?.slice(1)}</AlertDialogTitle>
            <AlertDialogDescription>
              {statusToSet === "approved" && "Are you sure you want to approve this application? This will add the applicant as a candidate."}
              {statusToSet === "rejected" && "Are you sure you want to reject this application?"}
              {statusToSet === "disqualified" && "Are you sure you want to disqualify this candidate?"}
              {statusToSet === "pending" && "Are you sure you want to revert this application to pending?"}
              {(statusToSet === "rejected" || statusToSet === "disqualified") && !feedback.trim() && (
                <p className="text-red-500 mt-2">Please provide feedback before proceeding.</p>
              )}
              {feedback.trim() && " Your feedback will be sent to the applicant."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => statusToSet && handleStatusChange(statusToSet)}
              disabled={(statusToSet === "rejected" || statusToSet === "disqualified") && !feedback.trim()}
              className={`
                ${statusToSet === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                ${statusToSet === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                ${statusToSet === "disqualified" ? "bg-orange-600 hover:bg-orange-700" : ""}
                ${statusToSet === "pending" ? "bg-blue-600 hover:bg-blue-700" : ""}
              `}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CandidateApplicationCard;
