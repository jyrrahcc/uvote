
import { Election } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ElectionHeaderProps {
  election: Election;
  hasVoted?: boolean; // Added hasVoted prop to the interface
  isVoter?: boolean; // Added isVoter prop to the interface
}

const ElectionHeader = ({ election, hasVoted = false, isVoter = false }: ElectionHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/elections')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Elections
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
      <p className="text-muted-foreground mb-4">{election.description}</p>
      
      {/* Status info */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Card className="bg-muted/50 w-full md:w-auto">
          <div className="py-4 px-4">
            <div className="text-sm font-medium flex items-center">
              <Timer className="h-4 w-4 mr-2" />
              Status: <span className="ml-2 capitalize">{election.status}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ElectionHeader;
