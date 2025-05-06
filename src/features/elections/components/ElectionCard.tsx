
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Election } from "@/types";
import { Users } from "lucide-react";

interface ElectionCardProps {
  election: Election;
}

/**
 * Card component to display an election
 */
const ElectionCard = ({ election }: ElectionCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: Election["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "upcoming":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{election.title}</CardTitle>
          <Badge variant={getStatusBadgeVariant(election.status)}>
            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
          </Badge>
        </div>
        <CardDescription>
          {election.description.length > 100
            ? `${election.description.substring(0, 100)}...`
            : election.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Date:</span>
            <span>{formatDate(election.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Date:</span>
            <span>{formatDate(election.endDate)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link to={`/elections/${election.id}`}>
            {election.status === "active"
              ? "Vote Now"
              : election.status === "upcoming"
                ? "View Details"
                : "View Results"}
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link to={`/elections/${election.id}/candidates`}>
            <Users className="mr-2 h-4 w-4" />
            View Candidates
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ElectionCard;
