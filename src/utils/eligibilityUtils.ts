
import { Election } from "@/types";
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
    // First check if the user has the voter or admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (roleError) {
      console.error("Error checking user roles:", roleError);
      return { isEligible: false, reason: "Failed to verify user roles" };
    }
    
    // Admin users are always eligible regardless of other criteria
    if (userRoles && userRoles.some(ur => ur.role === 'admin')) {
      return { isEligible: true, reason: null };
    }
    
    // Check if user has voter role - this is a basic requirement
    const hasVoterRole = userRoles && userRoles.some(ur => ur.role === 'voter');
    
    if (!hasVoterRole) {
      return { isEligible: false, reason: "You must have voter privileges to participate in this election" };
    }
    
    // Get user profile for department and year level checks
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('department, year_level')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return { isEligible: false, reason: "Could not verify user profile" };
    }
    
    const userDepartment = profile.department || '';
    const userYearLevel = profile.year_level || '';
    
    console.log("Eligibility check:", {
      userDepartment,
      userYearLevel,
      electionDepartments: election.departments,
      electionYearLevels: election.eligibleYearLevels
    });
    
    // If the election doesn't restrict voting, user with voter role is eligible
    // Only check after we have the profile information
    if (!election.restrictVoting) {
      return { isEligible: true, reason: null };
    }
    
    // Department eligibility check
    const isDepartmentEligible = !election.departments?.length || 
      election.departments.includes(userDepartment) || 
      election.departments.includes("University-wide");
    
    // Year level eligibility check
    const isYearLevelEligible = !election.eligibleYearLevels?.length || 
      election.eligibleYearLevels.includes(userYearLevel) || 
      election.eligibleYearLevels.includes("All Year Levels");
    
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
