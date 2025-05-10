
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CandidateFormData } from "../schemas/candidateFormSchema";
import { uploadFileToStorage } from "@/utils/fileUploadUtils";

interface UseCandidateRegistrationProps {
  electionId: string;
  userId: string;
  onCandidateAdded: (candidate: any) => void;
  onClose: () => void;
}

export const useCandidateRegistration = ({
  electionId,
  userId,
  onCandidateAdded,
  onClose
}: UseCandidateRegistrationProps) => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileVerified, setProfileVerified] = useState(false);
  
  // Fetch user profile and verification status
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        setProfileVerified(data?.is_verified || false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);
  
  const registerCandidate = async (values: CandidateFormData) => {
    try {
      // Check if profile is verified
      if (!profileVerified) {
        toast.error("You need to complete and verify your profile before registering as a candidate");
        return false;
      }
      
      // Check if user's department matches election departments and check year level eligibility
      if (userProfile?.department) {
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('departments, eligible_year_levels')
          .eq('id', electionId)
          .single();
          
        if (!electionError && electionData) {
          // Check if election is department-specific and user belongs to one of the specified departments
          if (Array.isArray(electionData.departments) && electionData.departments.length > 0) {
            const eligibleForElection = electionData.departments.includes(userProfile.department) || 
                                        electionData.departments.includes("University-wide");
                                       
            if (!eligibleForElection) {
              toast.error(`You cannot register as a candidate for this election because your department (${userProfile.department}) is not eligible.`);
              return false;
            }
          }
          
          // Check if user's year level is eligible
          if (Array.isArray(electionData.eligible_year_levels) && electionData.eligible_year_levels.length > 0 && 
              !electionData.eligible_year_levels.includes("All Year Levels") && userProfile.year_level) {
            const yearLevelEligible = electionData.eligible_year_levels.includes(userProfile.year_level);
            
            if (!yearLevelEligible) {
              toast.error(`You cannot register as a candidate for this election because your year level (${userProfile.year_level}) is not eligible.`);
              return false;
            }
          }
        }
      }
      
      setLoading(true);
      console.log("Registering candidate with data:", values);
      
      // Check if the image_url is from a temporary object URL
      let finalImageUrl = values.image_url;
      if (values.image_url && !values.image_url.includes('supabase.co') && values.image_url.startsWith('blob:')) {
        // This is a temporary object URL, let the user know
        console.log("Image URL is a temporary blob URL. It would need to be uploaded properly.");
        toast.warning("Image is in temporary format - please upload through the upload button");
        // We continue with registration but image might not persist
      }
      
      const newCandidate = {
        name: values.name,
        bio: values.bio,
        position: values.position,
        image_url: finalImageUrl || null,
        student_id: values.student_id || userProfile?.student_id || null,
        department: values.department || userProfile?.department || null,
        year_level: values.year_level || userProfile?.year_level || null,
        election_id: electionId,
        created_by: userId
      };
      
      const { data, error } = await supabase
        .from('candidates')
        .insert(newCandidate)
        .select();
      
      if (error) {
        console.error("Error registering candidate:", error);
        throw error;
      }
      
      console.log("Candidate registered successfully:", data);
      toast.success("Your candidate registration has been submitted successfully");
      
      onClose();
      
      if (data) {
        onCandidateAdded(data);
      }
      
      return true;
    } catch (error) {
      console.error("Error registering as candidate:", error);
      toast.error("Failed to register as candidate");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    registerCandidate,
    loading,
    profileVerified
  };
};
