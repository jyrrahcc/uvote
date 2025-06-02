
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Election } from "@/types";

export const useEligibleVoters = (election: Election, fallbackVoters?: number) => {
  const [actualEligibleVoters, setActualEligibleVoters] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibleVotersCount = async () => {
      try {
        setLoading(true);
        
        // Build the query to count eligible voters based on election criteria
        let query = supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        // Filter by departments/colleges if specified
        if (election.colleges && election.colleges.length > 0 && !election.colleges.includes("University-wide")) {
          query = query.in('department', election.colleges);
        }

        // Filter by year levels if specified
        if (election.eligibleYearLevels && election.eligibleYearLevels.length > 0 && !election.eligibleYearLevels.includes("All Year Levels & Groups")) {
          query = query.in('year_level', election.eligibleYearLevels);
        }

        const { count, error } = await query;

        if (error) {
          console.error('Error fetching eligible voters count:', error);
          setActualEligibleVoters(fallbackVoters || 0);
        } else {
          setActualEligibleVoters(count || 0);
        }
      } catch (error) {
        console.error('Error in fetchEligibleVotersCount:', error);
        setActualEligibleVoters(fallbackVoters || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleVotersCount();
  }, [election, fallbackVoters]);

  return { actualEligibleVoters, loading };
};
