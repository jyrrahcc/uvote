
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

const ResultsPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const [election, setElection] = useState<Election | null>(null);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (electionId) {
      loadData();
    }
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
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to fetch election results");
      navigate('/elections');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !election) {
    return <div className="text-center py-10">Loading election results...</div>;
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
