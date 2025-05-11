import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { Election, mapDbElectionToElection } from "@/types";

interface UseApplicationFormProps {
  electionId: string;
  userId: string;
  onSuccess?: () => void;
  onApplicationSubmitted?: () => void;
  onClose?: () => void;
}

export const useApplicationForm = ({
  electionId,
  userId,
  onSuccess,
  onApplicationSubmitted,
  onClose
}: UseApplicationFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{
    first_name?: string;
    last_name?: string;
    department?: string;
    year_level?: string;
    student_id?: string;
  }>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState(true);
  const [electionDetails, setElectionDetails] = useState<{
    departments?: string[];
    eligibleYearLevels?: string[];
    restrictVoting?: boolean;
  }>({});

  // Fetch election positions, user profile, and eligibility check on mount
  useEffect(() => {
    if (!electionId || !userId) return;
    
    const fetchData = async () => {
      try {
        // Fetch election details
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .single();
          
        if (electionError) throw electionError;
        
        if (electionData) {
          // Properly transform raw DB election to application Election type
          const election = mapDbElectionToElection(electionData);
          
          setElectionDetails({
            departments: electionData.departments,
            eligibleYearLevels: electionData.eligible_year_levels,
            restrictVoting: electionData.restrict_voting
          });
          
          if (electionData.positions) {
            setAvailablePositions(electionData.positions);
          }
          
          // Use the centralized eligibility checker
          const eligibilityCheck = await checkUserEligibility(userId, election);
          setIsEligible(eligibilityCheck.isEligible);
          if (!eligibilityCheck.isEligible) {
            setValidationError(eligibilityCheck.reason || "You are not eligible to participate in this election");
          }
        }
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, department, year_level, student_id')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          setUserProfile(profileData);
          // Pre-fill name from profile
          if (profileData.first_name && profileData.last_name) {
            setName(`${profileData.first_name} ${profileData.last_name}`);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load election data");
      }
    };
    
    fetchData();
  }, [electionId, userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in to submit an application");
      return;
    }
    
    if (!isEligible) {
      toast.error("You are not eligible to participate in this election");
      return;
    }
    
    if (!position) {
      toast.error("Please select a position");
      return;
    }
    
    if (!bio || bio.length < 10) {
      toast.error("Please provide a bio (minimum 10 characters)");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const applicationData = {
        name,
        position,
        bio,
        image_url: imageUrl,
        election_id: electionId,
        user_id: userId,
        status: 'pending',
        // Include additional profile info
        student_id: userProfile.student_id,
        department: userProfile.department,
        year_level: userProfile.year_level
      };
      
      const { data, error } = await supabase
        .from('candidate_applications')
        .insert(applicationData)
        .select();
      
      if (error) throw error;
      
      toast.success("Application submitted successfully");
      
      // Call all success callbacks
      if (onSuccess) onSuccess();
      if (onApplicationSubmitted) onApplicationSubmitted();
      
      // Handle closing
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    position,
    setPosition,
    bio,
    setBio,
    image,
    setImage,
    imageUrl,
    setImageUrl,
    submitting,
    setSubmitting,
    imageUploading,
    setImageUploading,
    availablePositions,
    userProfile,
    validationError,
    isEligible,
    handleSubmit
  };
};
