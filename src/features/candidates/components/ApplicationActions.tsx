
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, CheckCircle, XCircle, Ban, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { approveApplication, rejectApplication, disqualifyApplication } from "../services/applicationStatusService";

interface ApplicationActionsProps {
  applicationId: string;
  onAction?: (action: string) => void;
}

const ApplicationActions = ({ applicationId, onAction }: ApplicationActionsProps) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDisqualifyDialog, setShowDisqualifyDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approveApplication(applicationId);
      if (onAction) onAction("approve");
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Failed to approve application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      await rejectApplication(applicationId, reason);
      setShowRejectDialog(false);
      setReason("");
      if (onAction) onAction("reject");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisqualify = async () => {
    try {
      setIsSubmitting(true);
      await disqualifyApplication(applicationId, reason);
      setShowDisqualifyDialog(false);
      setReason("");
      if (onAction) onAction("disqualify");
    } catch (error) {
      console.error("Error disqualifying application:", error);
      toast.error("Failed to disqualify candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full">
            Actions <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-green-600 flex items-center" onClick={handleApprove}>
            <CheckCircle className="mr-2 h-4 w-4" /> Approve
          </DropdownMenuItem>
          <DropdownMenuItem className="text-orange-600 flex items-center" onClick={() => setShowRejectDialog(true)}>
            <XCircle className="mr-2 h-4 w-4" /> Reject
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600 flex items-center" onClick={() => setShowDisqualifyDialog(true)}>
            <Ban className="mr-2 h-4 w-4" /> Disqualify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Disqualify Dialog */}
      <Dialog open={showDisqualifyDialog} onOpenChange={setShowDisqualifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" /> Disqualify Candidate
            </DialogTitle>
            <DialogDescription>
              Disqualification is a serious action. Please provide a detailed reason which will be shared with the applicant.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter reason for disqualification..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisqualifyDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisqualify}
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Processing..." : "Disqualify Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationActions;
