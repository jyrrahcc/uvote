
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
import { Trash2 } from "lucide-react";

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
  const { user } = useAuth();

  const handleStatusChange = async (status: "approved" | "rejected") => {
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
    }
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
              src={application.image_url} 
              alt={`${application.name}'s campaign poster`} 
              className="w-full h-auto max-h-40 object-contain"
            />
          </div>
        )}
        
        {application.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Bio:</h4>
            <p className="text-sm">{application.bio}</p>
          </div>
        )}

        {isAdmin && application.status === "pending" && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Feedback (optional):</h4>
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
                  onClick={() => handleStatusChange("rejected")}
                  disabled={submitting}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => handleStatusChange("approved")}
                  disabled={submitting}
                >
                  Approve
                </Button>
              </>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
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
    </Card>
  );
};

export default CandidateApplicationCard;
