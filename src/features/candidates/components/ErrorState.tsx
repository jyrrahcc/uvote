
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string | null;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center py-12 border rounded-md">
        <p className="text-xl text-destructive font-medium mb-4">{error || "Election not found"}</p>
        <Button onClick={() => navigate('/elections')}>
          Back to Elections
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
