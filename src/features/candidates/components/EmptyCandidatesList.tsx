
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyCandidatesListProps {
  canRegister: boolean;
  onRegister: () => void;
}

const EmptyCandidatesList = ({ canRegister, onRegister }: EmptyCandidatesListProps) => {
  return (
    <div className="text-center py-12 border rounded-md mt-8">
      <p className="text-xl font-semibold">No candidates yet</p>
      <p className="text-muted-foreground mt-2">
        {canRegister ? 
          "Be the first to register as a candidate." : 
          "This election has no registered candidates yet."}
      </p>
      
      {canRegister && (
        <Button 
          className="mt-4" 
          onClick={onRegister}
        >
          Register as Candidate
        </Button>
      )}
    </div>
  );
};

export default EmptyCandidatesList;
