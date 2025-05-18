import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Voter {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  year_level?: string;
}

export const useEligibleVoters = (
  electionId: string | null,
  isNewElection: boolean
) => {
  // State for voters
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);

  // Fetch all potential voters (profiles)
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        setLoading(true);

        // Load all profiles for potential voters
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, department, year_level");

        if (profilesError) throw profilesError;

        setAllVoters(profilesData || []);

        // If editing existing election, fetch eligible voters
        if (electionId) {
          const { data: eligibleData, error: eligibleError } = await supabase
            .from("eligible_voters")
            .select("user_id")
            .eq("election_id", electionId);

          if (eligibleError) throw eligibleError;

          // Set selected voters based on eligible_voters table
          setSelectedVoters(eligibleData.map((item) => item.user_id));
        }
      } catch (error) {
        console.error("Error fetching voters:", error);
        toast.error("Failed to load voters");
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, [electionId]);

  // Filter voters based on search term and filters
  const filteredVoters = allVoters.filter((voter) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      voter.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !departmentFilter || voter.department === departmentFilter;

    const matchesYear = !yearFilter || voter.year_level === yearFilter;

    return matchesSearch && matchesDepartment && matchesYear;
  });

  // Handle selecting/deselecting a voter
  const handleSelectVoter = (userId: string) => {
    setSelectedVoters((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle toggle all visible voters
  const handleToggleAllVoters = () => {
    const allVisible = filteredVoters.map((voter) => voter.id);

    if (allVisible.every((id) => selectedVoters.includes(id))) {
      // If all visible are selected, deselect them
      setSelectedVoters((prev) =>
        prev.filter((id) => !allVisible.includes(id))
      );
    } else {
      // Otherwise, select all visible
      const newSelection = [...selectedVoters];
      allVisible.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      setSelectedVoters(newSelection);
    }
  };

  // Handle selecting by department
  const handleSelectByDepartment = () => {
    if (!departmentFilter) return;

    const departmentVoterIds = allVoters
      .filter((voter) => voter.department === departmentFilter)
      .map((voter) => voter.id);

    setSelectedVoters((prev) => {
      const newSelection = [...prev];
      departmentVoterIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Handle selecting by year
  const handleSelectByYear = () => {
    if (!yearFilter) return;

    const yearVoterIds = allVoters
      .filter((voter) => voter.year_level === yearFilter)
      .map((voter) => voter.id);

    setSelectedVoters((prev) => {
      const newSelection = [...prev];
      yearVoterIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedVoters([]);
  };

  // Save eligible voters for existing election
  const handleSaveEligibleVoters = async () => {
    if (!electionId) return;

    try {
      setSaving(true);

      // First delete all existing eligible voters for this election
      const { error: deleteError } = await supabase
        .from("eligible_voters")
        .delete()
        .eq("election_id", electionId);

      if (deleteError) throw deleteError;

      // Insert new eligible voters
      if (selectedVoters.length > 0) {
        const { error: insertError } = await supabase
          .from("eligible_voters")
          .insert(
            selectedVoters.map((userId) => ({
              election_id: electionId,
              user_id: userId,
              added_by: (await supabase.auth.getUser()).data.user?.id,
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success("Eligible voters saved successfully");
    } catch (error) {
      console.error("Error saving eligible voters:", error);
      toast.error("Failed to save eligible voters");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    allVoters,
    selectedVoters,
    filteredVoters,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    yearFilter,
    setYearFilter,
    handleSelectVoter,
    handleToggleAllVoters,
    handleSelectByDepartment,
    handleSelectByYear,
    handleClearSelection,
    handleSaveEligibleVoters,
  };
};
