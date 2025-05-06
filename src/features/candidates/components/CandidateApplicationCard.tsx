
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, CheckCircle, Clock, FileText, X } from "lucide-react";
import { CandidateApplication } from "@/types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import { updateCandidateApplication } from "../services/candidateApplicationService";
import { formatDate } from "@/utils/dateUtils";

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  isAdmin: boolean;
  onStatusChange?: () => void;
}

const CandidateApplicationCard = ({ application, isAdmin, onStatusChange }: CandidateApplicationCardProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    try {
      setLoading(newStatus);
      await updateCandidateApplication(application.id, {
        status: newStatus,
        feedback: feedback || undefined
      });

      toast.success(`Application ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error(`Error ${newStatus} application:`, error);
      toast.error(`Failed to ${newStatus === "approved" ? "approve" : "reject"} application`);
    } finally {
      setLoading(null);
    }
  };

  const isPending = application.status === "pending";
  const isApproved = application.status === "approved";
  const isRejected = application.status === "rejected";

  return (
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
          
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">
              Submitted on {formatDate(application.created_at)}
            </p>
          </div>
        </div>
      </CardContent>

      {isAdmin && isPending && (
        <CardFooter className="flex flex-col gap-2">
          <div className="flex gap-2 w-full">
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
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateApplicationCard;
