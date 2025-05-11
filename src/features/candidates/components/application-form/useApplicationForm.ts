
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Election, mapDbElectionToElection } from "@/types";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

interface UseApplicationFormProps {
  electionId: string;
  userId: string;
  onSuccess?: (candidate?: any) => void;  // Updated type to accept optional parameter
  onApplicationSubmitted?: () => void;
  onClose?: () => void;
  initialEligibility?: boolean;
  initialEligibilityReason?: string | null;
}

export const useApplicationForm = ({
  electionId,
  userId,
  onSuccess,
  onApplicationSubmitted,
  onClose,
  initialEligibility,
  initialEligibilityReason
}: UseApplicationFormProps) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [isEligible, setIsEligible] = useState(initialEligibility !== undefined ? initialEligibility : true);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(initialEligibilityReason || null);
  const [election, setElection] = useState<Election | null>(null);

  // Load user profile & election details
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          setUserProfile(profileData);
          setName(`${profileData.first_name} ${profileData.last_name}`);
        }

        // Fetch election details including available positions
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .single();

        if (electionError) {
          throw electionError;
        }

        if (electionData) {
          // Use the mapper function to convert the DB election to the application Election type
          const mappedElection = mapDbElectionToElection(electionData);
          setElection(mappedElection);
          setAvailablePositions(mappedElection.positions || []);
          
          // Check eligibility if not provided externally
          if (initialEligibility === undefined) {
            const eligibilityResult = await checkUserEligibility(userId, mappedElection);
            setIsEligible(eligibilityResult.isEligible);
            setEligibilityReason(eligibilityResult.reason);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load necessary data for application');
      }
    };

    if (userId && electionId) {
      loadData();
    }
  }, [userId, electionId, initialEligibility]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligible) {
      toast.error("You are not eligible to apply for candidacy in this election");
      return;
    }

    try {
      setSubmitting(true);
      setValidationError(null);

      // Validate required fields
      if (!name || !position) {
        setValidationError("Name and position are required");
        return;
      }

      // Create the application data
      const applicationData = {
        id: uuidv4(),
        user_id: userId,
        election_id: electionId,
        name,
        position,
        bio: bio.trim() || null,
        image_url: imageUrl || null,
        status: 'pending'
      };

      // Insert into the database
      const { error } = await supabase
        .from('candidate_applications')
        .insert(applicationData);

      if (error) throw error;

      toast.success("Your application has been submitted for review");
      
      // Call success callbacks
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
      if (onSuccess) {
        onSuccess({});
      }
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
      setValidationError(error.message || "An error occurred while submitting your application");
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
    imageUploading,
    setImageUploading,
    availablePositions,
    userProfile,
    validationError,
    isEligible,
    eligibilityReason,
    handleSubmit,
  };
};
