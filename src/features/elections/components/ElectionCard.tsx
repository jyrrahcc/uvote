
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { University, Clock, Users, ArrowRight, LockIcon } from "lucide-react";
import { Election } from "@/types";

interface ElectionCardProps {
  election: Election;
}

const ElectionCard = ({ election }: ElectionCardProps) => {
  const getStatusColor = () => {
    switch (election.status) {
      case 'active':
        return "bg-green-100 text-green-800 border-green-300";
      case 'upcoming':
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 'completed':
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getStatusLabel = () => {
    switch (election.status) {
      case 'active':
        return "Active";
      case 'upcoming':
        return "Upcoming";
      case 'completed':
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const isActive = election.status === 'active';
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {/* Add DLSU-D green color banner at the top */}
      <div className="w-full h-2 bg-[#008f50]"></div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{election.title}</CardTitle>
          <Badge className={`${getStatusColor()} border`}>{getStatusLabel()}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{election.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-2">
          {election.department && (
            <div className="flex items-center text-sm">
              <University className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{election.department}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          </div>
          
          {election.isPrivate && (
            <div className="flex items-center">
              <LockIcon className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm text-amber-700">Private Election</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button asChild className="w-full justify-between bg-[#008f50] hover:bg-[#007a45]">
          <Link to={`/elections/${election.id}`}>
            {isActive ? "Vote Now" : election.status === 'completed' ? "View Results" : "View Details"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ElectionCard;
