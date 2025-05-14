
import { Election } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user is eligible for an election based on college and year level
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
    
    // Get user profile for college and year level checks
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('department, year_level')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return { isEligible: false, reason: "Could not verify user profile" };
    }
    
    if (!profile) {
      return { isEligible: false, reason: "User profile not found. Please complete your profile information." };
    }
    
    const userCollege = profile.department || '';
    const userYearLevel = profile.year_level || '';
    
    // If the election doesn't restrict voting, user with voter role is eligible
    if (!election.restrictVoting) {
      return { isEligible: true, reason: null };
    }
    
    console.log("Eligibility check:", {
      userCollege,
      userYearLevel,
      electionColleges: election.colleges,
      electionYearLevels: election.eligibleYearLevels
    });
    
    // College eligibility check - use colleges (formerly departments) 
    const isCollegeEligible = !election.colleges?.length || 
      election.colleges.includes(userCollege) || 
      election.colleges.includes("University-wide");
    
    // Year level eligibility check
    const isYearLevelEligible = !election.eligibleYearLevels?.length || 
      election.eligibleYearLevels.includes(userYearLevel) || 
      election.eligibleYearLevels.includes("All Year Levels");
    
    // Build appropriate reason message if not eligible
    let reason = null;
    if (!isCollegeEligible && !isYearLevelEligible) {
      reason = `This election is for ${election.colleges?.join(', ')} colleges and ${election.eligibleYearLevels?.join(', ')} year levels. Your profile shows you're in ${userCollege} and are ${userYearLevel}.`;
    } else if (!isCollegeEligible) {
      reason = `This election is for ${election.colleges?.join(', ')} colleges, but your profile shows you're in ${userCollege}.`;
    } else if (!isYearLevelEligible) {
      reason = `This election is for ${election.eligibleYearLevels?.join(', ')} year levels, but your profile shows you're in ${userYearLevel}.`;
    }
    
    return {
      isEligible: isCollegeEligible && isYearLevelEligible,
      reason
    };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return { isEligible: false, reason: "An error occurred while checking eligibility" };
  }
}
