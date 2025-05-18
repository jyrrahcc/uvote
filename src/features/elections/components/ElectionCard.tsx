
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, Lock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Election } from "@/types";

interface ElectionCardProps {
  election: Election;
  isAccessVerified?: boolean;
}

/**
 * Election card component
 */
const ElectionCard = ({ election, isAccessVerified = false }: ElectionCardProps) => {
  // Helper functions for date formatting and status checks
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate status badge
  const renderStatusBadge = () => {
    switch (election.status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-gray-200">Completed</Badge>;
      default:
        return null;
    }
  };

  // Determine if election is in candidacy period
  const isInCandidacyPeriod = () => {
    if (!election.candidacyStartDate || !election.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  // Determine the card action based on election status
  const getCardAction = () => {
    if (election.status === 'completed') {
      return (
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/elections/${election.id}/results`}>
            View Results <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    } 
    
    if (election.status === 'active') {
      if (election.isPrivate && !isAccessVerified) {
        return (
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link to={`/elections/${election.id}`}>
              Access Election <Lock className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        );
      }
      
      return (
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/elections/${election.id}/vote`}>
            Vote Now <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    }
    
    if (isInCandidacyPeriod()) {
      return (
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/elections/${election.id}/candidates`}>
            Apply as Candidate <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    }
    
    return (
      <Button asChild className="w-full">
        <Link to={`/elections/${election.id}`}>
          View Details <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {election.bannerUrls && election.bannerUrls.length > 0 ? (
        <div className="relative w-full h-36">
          <img 
            src={election.bannerUrls[0]} 
            alt={election.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            {renderStatusBadge()}
          </div>
        </div>
      ) : (
        <div className="bg-muted/40 w-full h-24 flex items-center justify-center">
          <div className="absolute top-2 right-2">
            {renderStatusBadge()}
          </div>
          <Users className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle>{election.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {election.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatDate(election.startDate)} - {formatDate(election.endDate)}
          </span>
        </div>
        
        {election.department && (
          <Badge variant="outline" className="mr-1">
            {election.department}
          </Badge>
        )}
        
        {election.isPrivate && (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            <Lock className="mr-1 h-3 w-3" /> Private
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {getCardAction()}
      </CardFooter>
    </Card>
  );
};

export default ElectionCard;
