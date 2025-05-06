
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { toast } from "sonner";

/**
 * Fetches election details by ID
 */
export const fetchElectionDetails = async (electionId: string): Promise<Election> => {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error("Election not found");
    }
    
    // Transform the data to match our Election interface
    return mapDbElectionToElection(data);
  } catch (error) {
    console.error("Error fetching election details:", error);
    throw error;
  }
};

/**
 * Updates election status based on current date
 */
export const updateElectionStatus = async (election: Election): Promise<Election> => {
  try {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    let status: 'upcoming' | 'active' | 'completed' = election.status;
    
    if (now >= endDate && status !== 'completed') {
      status = 'completed';
    } else if (now >= startDate && now < endDate && status !== 'active') {
      status = 'active';
    } else if (now < startDate && status !== 'upcoming') {
      status = 'upcoming';
    } else {
      // Status doesn't need to change
      return election;
    }
    
    const { error } = await supabase
      .from('elections')
      .update({ status })
      .eq('id', election.id);
    
    if (error) throw error;
    
    return { ...election, status };
  } catch (error) {
    console.error("Error updating election status:", error);
    toast.error("Failed to update election status");
    return election;
  }
};
