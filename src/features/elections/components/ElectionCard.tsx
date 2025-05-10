
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Info, Lock, Vote, Users, Eye } from "lucide-react";
import { Election } from "@/types";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AccessCodeInput from "./AccessCodeInput";

interface ElectionCardProps {
  election: Election;
  isAccessVerified?: boolean;
}

const ElectionCard = ({ election, isAccessVerified = false }: ElectionCardProps) => {
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const navigate = useNavigate();

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDepartmentBadge = () => {
    return (
      <Badge variant="secondary" className="ml-2">
        <Users className="mr-1 h-3 w-3" />
        {election.departments && election.departments.length > 0 
          ? (election.departments.includes("University-wide") ? "University-wide" : election.departments[0]) 
          : election.department || "All Departments"}
      </Badge>
    );
  };

  const isInCandidacyPeriod = () => {
    if (!election.candidacyStartDate || !election.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  const handleCardClick = () => {
    if (election.isPrivate && !isAccessVerified) {
      setShowAccessDialog(true);
      return;
    }
    
    navigate(`/elections/${election.id}`);
  };

  const handleAccessVerified = (accessCode: string) => {
    // Store the verified access code in localStorage
    try {
      const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
      verifiedElections[accessCode] = true;
      localStorage.setItem('verifiedElections', JSON.stringify(verifiedElections));
    } catch (error) {
      console.error("Error storing access verification:", error);
    }
    
    navigate(`/elections/${election.id}`);
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-1">{election.title}</CardTitle>
            {election.isPrivate && (
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge className={getStatusClasses(election.status)}>
              {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
            </Badge>
            {getDepartmentBadge()}
            {isInCandidacyPeriod() && election.status === 'upcoming' && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                Candidacy Open
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {election.description || "No description provided."}
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {format(new Date(election.startDate), 'MMM d, yyyy')} - {format(new Date(election.endDate), 'MMM d, yyyy')}
            </span>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleCardClick}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Election
          </Button>
        </CardFooter>
      </Card>
      
      <AccessCodeInput 
        isOpen={showAccessDialog}
        setIsOpen={setShowAccessDialog}
        electionTitle={election.title}
        correctCode={election.accessCode || ''}
        onAccessVerified={handleAccessVerified}
      />
    </>
  );
};

export default ElectionCard;
