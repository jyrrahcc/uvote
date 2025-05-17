
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication, Election, mapDbElectionToElection } from "@/types";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { v4 as uuidv4 } from "uuid";
import { processApplicationWithProfile } from "./base/applicationBaseService";

/**
 * Check if user is eligible to apply for an election
 */
export const checkUserEligibilityForElection = async (userId: string, election: Election): Promise<{isEligible: boolean; reason: string | null}> => {
  try {
    // Use the centralized eligibility checker
    return await checkUserEligibility(userId, election);
  } catch (error) {
    console.error("Error checking user eligibility:", error);
    return { isEligible: false, reason: "Error checking eligibility" };
  }
};

/**
 * Submit a new candidate application
 */
export const submitCandidateApplication = async (applicationData: Omit<CandidateApplication, 'id'>): Promise<CandidateApplication> => {
  try {
    // Generate a UUID for the application
    const id = uuidv4();
    
    // Check eligibility first
    const { data: electionData, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .eq('id', applicationData.election_id)
      .single();
      
    if (electionError) throw electionError;
    
    const election = mapDbElectionToElection(electionData);
    const eligibilityResult = await checkUserEligibility(applicationData.user_id, election);
    
    if (!eligibilityResult.isEligible) {
      throw new Error(eligibilityResult.reason || "You are not eligible to apply for this election");
    }
    
    // If eligible, proceed with submission
    const { data, error } = await supabase
      .from('candidate_applications')
      .insert({
        id,
        ...applicationData,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles!candidate_applications_user_id_fkey (
          first_name, last_name, department, year_level, student_id
        )
      `)
      .single();
      
    if (error) throw error;
    
    return processApplicationWithProfile(data);
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
};
