
import { Election, mapDbElectionToElection } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user is eligible for an election based on department and year level
 */
export async function checkUserEligibility(
  userId: string | null | undefined,
  election: Election | Partial<Election> | null
): Promise<{ isEligible: boolean; reason: string | null }> {
  // If no user or election, they're not eligible
  if (!userId || !election) {
    return { isEligible: false, reason: "Missing user or election data" };
  }
  
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('department, year_level, is_verified')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return { isEligible: false, reason: "Could not verify user profile" };
    }

    // Check if user profile is verified
    if (!profile.is_verified) {
      return { 
        isEligible: false, 
        reason: "Your profile must be verified before you can participate in elections" 
      };
    }
    
    const userDepartment = profile.department || '';
    const userYearLevel = profile.year_level || '';
    
    // Department eligibility check
    const isDepartmentEligible = election.restrictVoting 
      ? election.departments?.length 
        ? election.departments.includes(userDepartment) || 
          election.departments.includes("University-wide")
        : true
      : true;
    
    // Year level eligibility check
    const isYearLevelEligible = election.restrictVoting
      ? election.eligibleYearLevels?.length
        ? election.eligibleYearLevels.includes(userYearLevel) || 
          election.eligibleYearLevels.includes("All Year Levels")
        : true
      : true;
    
    // Build appropriate reason message if not eligible
    let reason = null;
    if (!isDepartmentEligible && !isYearLevelEligible) {
      reason = `This election is for ${election.departments?.join(', ')} departments and ${election.eligibleYearLevels?.join(', ')} year levels. Your profile shows you're in ${userDepartment} and are ${userYearLevel}.`;
    } else if (!isDepartmentEligible) {
      reason = `This election is for ${election.departments?.join(', ')} departments, but your profile shows you're in ${userDepartment}.`;
    } else if (!isYearLevelEligible) {
      reason = `This election is for ${election.eligibleYearLevels?.join(', ')} year levels, but your profile shows you're in ${userYearLevel}.`;
    }
    
    return {
      isEligible: isDepartmentEligible && isYearLevelEligible,
      reason
    };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return { isEligible: false, reason: "An error occurred while checking eligibility" };
  }
}
