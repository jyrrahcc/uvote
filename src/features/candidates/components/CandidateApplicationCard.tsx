
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, X, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CandidateApplication, updateApplicationStatus } from "../services/candidateApplicationService";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  onStatusUpdate: () => void;
}

const CandidateApplicationCard = ({ application, onStatusUpdate }: CandidateApplicationCardProps) => {
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedback, setFeedback] = useState(application.feedback || "");
  const [processing, setProcessing] = useState(false);
  
  const handleApprove = async () => {
    try {
      setProcessing(true);
      await updateApplicationStatus(application.id, "approved", feedback);
      onStatusUpdate();
    } finally {
      setProcessing(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setProcessing(true);
      await updateApplicationStatus(application.id, "rejected", feedback);
      onStatusUpdate();
    } finally {
      setProcessing(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };
  
  const isPending = application.status === "pending";
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{application.name}</CardTitle>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <CardDescription>
          Position: {application.position}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex space-x-4 mb-4">
          <Avatar className="h-12 w-12 border">
            {application.imageUrl ? (
              <AvatarImage src={application.imageUrl} alt={application.name} />
            ) : (
              <AvatarFallback>
                {getInitials(application.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">
              Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
            </p>
            <p className="text-sm mt-1">{application.bio}</p>
          </div>
        </div>
        
        {(application.feedback || showFeedbackInput) && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Feedback:</p>
            {isPending ? (
              <Textarea 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)} 
                placeholder="Add feedback (optional)" 
                className="text-sm"
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">{application.feedback || "No feedback provided"}</p>
            )}
          </div>
        )}
      </CardContent>
      
      {isPending && (
        <CardFooter className="flex justify-between pt-2 border-t bg-muted/10">
          {!showFeedbackInput && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFeedbackInput(true)}
            >
              Add Feedback
            </Button>
          )}
          
          <div className="ml-auto flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={processing}>
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject this application? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground">
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button size="sm" disabled={processing} onClick={handleApprove}>
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateApplicationCard;
