
import { useState, useEffect } from "react";
import { fetchCandidateApplications, CandidateApplication } from "../services/candidateApplicationService";

export const useCandidateApplications = (electionId: string) => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateApplications(electionId);
      setApplications(data);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      loadApplications();
    }
  }, [electionId]);

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  const pendingCount = applications.filter(app => app.status === "pending").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

  return {
    applications,
    filteredApplications,
    loading,
    activeTab,
    setActiveTab,
    pendingCount,
    approvedCount,
    rejectedCount,
    loadApplications
  };
};
