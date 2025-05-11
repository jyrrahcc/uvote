
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ElectionLoadingState = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link to="/elections"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections</Link>
        </Button>
      </div>
      <div className="text-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-xl mb-2">Loading election details...</div>
        <p className="text-sm text-muted-foreground">Please wait while we fetch the election information.</p>
      </div>
    </div>
  );
};

export default ElectionLoadingState;
