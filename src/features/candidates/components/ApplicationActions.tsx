
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X, Trash2, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { CandidateApplication } from "@/types";
import { approveApplication, rejectApplication, disqualifyApplication, deleteCandidateApplication } from "../services/applicationStatusService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ApplicationActionsProps {
  application: CandidateApplication;
  onSuccess?: () => void;
}

const ApplicationActions = ({ application, onSuccess }: ApplicationActionsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatusUpdate = async (action: 'approve' | 'reject' | 'disqualify') => {
    setIsSubmitting(true);
    try {
      let success = false;
      
      switch (action) {
        case 'approve':
          success = await approveApplication(application.id);
          toast.success("Application approved");
          break;
        case 'reject':
          success = await rejectApplication(application.id);
          toast.success("Application rejected");
          break;
        case 'disqualify':
          success = await disqualifyApplication(application.id);
          toast.success("Candidate disqualified");
          break;
      }
      
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      toast.error(`Failed to ${action} application`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const success = await deleteCandidateApplication(application.id);
      
      if (success) {
        toast.success("Application deleted successfully");
        if (onSuccess) onSuccess();
      } else {
        toast.error("Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    } finally {
      setIsSubmitting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isSubmitting}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {application.status === 'pending' && (
            <>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('approve')}
                disabled={isSubmitting}
                className="text-green-600"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('reject')}
                disabled={isSubmitting}
                className="text-red-500"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
          
          {application.status === 'approved' && (
            <DropdownMenuItem 
              onClick={() => handleStatusUpdate('disqualify')}
              disabled={isSubmitting}
              className="text-amber-600"
            >
              <AlertOctagon className="mr-2 h-4 w-4" />
              Disqualify
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setConfirmDelete(true)}
            disabled={isSubmitting} 
            className="text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this candidate application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApplicationActions;
