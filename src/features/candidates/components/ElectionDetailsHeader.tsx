
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Election } from "@/types";

interface ElectionDetailsHeaderProps {
  election: Election | null;
  loading: boolean;
}

const ElectionDetailsHeader = ({ election, loading }: ElectionDetailsHeaderProps) => {
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <>
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/elections')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Elections
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{election?.title || 'Candidates'}</h1>
          <p className="text-muted-foreground">{election?.description || ''}</p>
        </div>
      </div>

      {/* Election status info */}
      <Card className="mb-8 bg-muted/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="capitalize">{election?.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p>{election ? new Date(election.startDate).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">End Date</p>
              <p>{election ? new Date(election.endDate).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ElectionDetailsHeader;
