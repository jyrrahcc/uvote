
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Election } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import VoterEligibilityAlert from "../VoterEligibilityAlert";
import ElectionBanner from "../detail-page/ElectionBanner";
import ElectionTitleSection from "../detail-page/ElectionTitleSection";

interface VoterAccessRestrictionProps {
  election: Election;
  reason: string | null;
}

const VoterAccessRestriction = ({ election, reason }: VoterAccessRestrictionProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/elections')}
      >
        <span className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Back to Elections
        </span>
      </Button>
      
      <ElectionTitleSection title={election.title} description={election.description} />
      
      <ElectionBanner bannerUrls={election.banner_urls} title={election.title} />
      
      <Card className="mt-8 border-red-200 bg-red-50/30">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <VoterEligibilityAlert 
            election={election}
            reason={reason}
          />
          
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/elections')}
            >
              Return to Elections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterAccessRestriction;
