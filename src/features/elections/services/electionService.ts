
import { supabase } from "@/integrations/supabase/client";
import { Election } from "@/types";
import { toast } from "sonner";

/**
 * Fetches election details by ID
 */
export const fetchElectionDetails = async (electionId: string): Promise<Election> => {
  try {
    // Using generic syntax for Supabase to avoid type errors
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();
    
    if (error) throw error;
    
    // Type casting to match our Election type
    return data as unknown as Election;
  } catch (error) {
    console.error("Error fetching election details:", error);
    throw error;
  }
};
