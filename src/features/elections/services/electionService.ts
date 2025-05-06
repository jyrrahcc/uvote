
import { supabase } from "@/integrations/supabase/client";
import { Election, DbElection, mapDbElectionToElection } from "@/types";
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
    return mapDbElectionToElection(data as DbElection);
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
    
    if (error) {
      console.error("Error updating election status:", error);
      throw error;
    }
    
    return { ...election, status };
  } catch (error) {
    console.error("Error updating election status:", error);
    toast.error(`Failed to update election status: ${error instanceof Error ? error.message : "Unknown error"}`);
    return election;
  }
};

/**
 * Creates a new election
 */
export const createElection = async (electionData: any, userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('elections')
      .insert([{
        ...electionData,
        created_by: userId
      }])
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after creating election");
    }
    
    return data[0].id;
  } catch (error) {
    console.error("Error creating election:", error);
    throw error;
  }
};
