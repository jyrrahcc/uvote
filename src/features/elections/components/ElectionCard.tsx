
import { Calendar, Users, Lock, ChevronRight, University, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Election } from "@/types";

interface ElectionCardProps {
  election: Election;
  isAccessVerified?: boolean;
}

const ElectionCard = ({ election, isAccessVerified = false }: ElectionCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };
  
  const getStatusBadge = () => {
    switch (election.status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return null;
    }
  };

  const isInCandidacyPeriod = () => {
    if (!election.candidacyStartDate || !election.candidacyEndDate) {
      return false;
    }
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  // Get first banner image if available
  const hasBanner = election.banner_urls && election.banner_urls.length > 0;
  const firstBanner = hasBanner ? election.banner_urls[0] : null;
  
  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      {/* Banner image */}
      {firstBanner && (
        <div className="w-full h-[160px] overflow-hidden">
          <img 
            src={firstBanner} 
            alt={election.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
              e.currentTarget.className = "w-full h-full object-contain p-4";
            }}
          />
        </div>
      )}

      <CardHeader className={`pb-2 ${firstBanner ? 'pt-3' : 'pt-6'}`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{election.title}</CardTitle>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {isInCandidacyPeriod() && (
              <Badge className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap">
                Accepting Candidates
              </Badge>
            )}
            {election.isPrivate && !isAccessVerified && (
              <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-600">
                <Lock className="h-3 w-3" />
                <span>Private</span>
              </Badge>
            )}
          </div>
        </div>
        
        <CardDescription className="flex items-center gap-1 text-muted-foreground">
          <University className="h-3.5 w-3.5 mr-0.5" />
          <span>
            {election.departments && election.departments.length > 0
              ? election.departments.length > 1
                ? `${election.departments[0]} +${election.departments.length - 1}`
                : election.departments[0]
              : election.department || "University-wide"}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {election.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{election.description}</p>
        )}
        
        <div className="space-y-3">
          {election.candidacyStartDate && election.candidacyEndDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-600">Candidacy Period</p>
                <p className="text-sm">
                  {formatDate(election.candidacyStartDate)} - {formatDate(election.candidacyEndDate)}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium">Voting Period</p>
              <p className="text-sm">
                {formatDate(election.startDate)} - {formatDate(election.endDate)}
              </p>
            </div>
          </div>
          
          {election.restrictVoting && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium">Voter Eligibility</p>
                <p className="text-sm">Restricted to selected DLSU-D community members</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <Button 
          variant="default" 
          className="w-full"
          asChild
        >
          <Link to={`/elections/${election.id}`}>
            {election.status === "completed" ? "View Results" : "View Election"} 
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ElectionCard;
