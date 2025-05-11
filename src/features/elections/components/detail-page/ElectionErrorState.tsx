
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ElectionErrorStateProps {
  error: string | null;
}

const ElectionErrorState: React.FC<ElectionErrorStateProps> = ({ error }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
        </Button>
      </div>
      <div className="text-center py-12 border rounded-md">
        <p className="text-xl text-destructive font-medium mb-4">
          {error || "Election not found"}
        </p>
        <Button asChild>
          <Link to="/elections">Return to Elections</Link>
        </Button>
      </div>
    </div>
  );
};

export default ElectionErrorState;
