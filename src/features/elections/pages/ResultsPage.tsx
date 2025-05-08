
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Election, ElectionResult } from "@/types";
import ResultsChart from "@/features/results/components/ResultsChart";
import ResultsSummary from "@/features/results/components/ResultsSummary";
import DetailedResults from "@/features/results/components/DetailedResults";
import { fetchElectionDetails } from "../services/electionService";
import { fetchElectionResults } from "../services/resultService";
import ElectionHeader from "../components/ElectionHeader";
import { Card } from "@/components/ui/card";

const ResultsPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!electionId) {
      setError("Election ID is missing");
      setLoading(false);
      return;
    }
    
    loadData();
  }, [electionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch election details
      const electionData = await fetchElectionDetails(electionId!);
      setElection(electionData);
      
      // Fetch results
      const resultData = await fetchElectionResults(electionId!);
      setResult(resultData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to fetch election results");
      toast.error("Failed to fetch election results");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading election results...</div>;
  }

  if (error || !election) {
    return (
      <Card className="p-6 text-center">
        <div className="text-2xl font-bold text-red-500 mb-4">Error</div>
        <div className="text-muted-foreground mb-4">{error || "Failed to load election"}</div>
        <button 
          onClick={() => navigate('/elections')}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          Back to Elections
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ElectionHeader election={election} />
      
      {result && (
        <>
          <ResultsSummary result={result} electionStatus={election.status} />
          <ResultsChart result={result} />
          <DetailedResults result={result} />
        </>
      )}
    </div>
  );
};

export default ResultsPage;
