import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Mail, MessageSquare, Calendar } from "lucide-react";
import { CandidateApplication } from "@/types";

interface CandidateApplicationCardProps {
  application: CandidateApplication;
  onAction?: (action: 'approve' | 'reject', applicationId: string) => void;
}

const CandidateApplicationCard = ({ application, onAction }: CandidateApplicationCardProps) => {
  const handleApprove = () => {
    onAction && onAction('approve', application.id);
  };

  const handleReject = () => {
    onAction && onAction('reject', application.id);
  };

  const imageUrl = application.imageUrl;
  const yearLevel = application.yearLevel;
  const reviewedAt = application.reviewedAt;
  const reviewedBy = application.reviewedBy;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{application.name}</CardTitle>
        <CardDescription>{application.position}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={application.name} />
            ) : (
              <AvatarFallback>{application.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{application.name}</p>
            <p className="text-sm text-muted-foreground">
              {application.department} - {yearLevel}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{application.userId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{application.userId}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{application.bio}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {application.createdAt}</span>
          </div>
          {application.status !== 'pending' && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Status: {application.status}</span>
            </div>
          )}
          {reviewedAt && reviewedBy && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Reviewed At: {reviewedAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Reviewed By: {reviewedBy}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      {onAction && application.status === 'pending' && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleApprove}>Approve</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateApplicationCard;
