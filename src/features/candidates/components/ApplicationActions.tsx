
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, AlertTriangle } from "lucide-react";
import { 
  approveApplication, 
  rejectApplication,
  disqualifyApplication 
} from "../services/applicationStatusService";

interface ApplicationActionsProps {
  applicationId: string;
  onStatusChange: () => void;
}

const ApplicationActions = ({ applicationId, onStatusChange }: ApplicationActionsProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDisqualifyDialog, setShowDisqualifyDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approveApplication(applicationId);
      onStatusChange();
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim() && showRejectDialog) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      await rejectApplication(applicationId, reason);
      setShowRejectDialog(false);
      setReason('');
      onStatusChange();
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisqualify = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for disqualification');
      return;
    }

    try {
      setIsSubmitting(true);
      await disqualifyApplication(applicationId, reason);
      setShowDisqualifyDialog(false);
      setReason('');
      onStatusChange();
    } catch (error) {
      console.error('Error disqualifying application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleApprove}
          disabled={isSubmitting}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" /> Approve
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRejectDialog(true)}
          disabled={isSubmitting}
          className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
        >
          <X className="h-4 w-4" /> Reject
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDisqualifyDialog(true)}
          disabled={isSubmitting}
          className="flex items-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <AlertTriangle className="h-4 w-4" /> Disqualify
        </Button>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this application. This will be visible to the applicant.
            </p>
            <Textarea 
              placeholder="Reason for rejection..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disqualify Dialog */}
      <Dialog open={showDisqualifyDialog} onOpenChange={setShowDisqualifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disqualify Candidate</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for disqualifying this candidate. This action is more serious than rejection and will be visible to the applicant and voters.
            </p>
            <Textarea 
              placeholder="Reason for disqualification..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisqualifyDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDisqualify}
              disabled={isSubmitting}
            >
              Disqualify Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationActions;
