
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Election, DbElection, mapDbElectionToElection } from "@/types";
import { checkUserEligibility } from "@/utils/eligibilityUtils";

// Department and year level constants
export const DLSU_DEPARTMENTS = [
  "College of Science (COS)",
  "College of Liberal Arts (CLA)",
  "College of Engineering and Architecture (CEA)",
  "College of Education (COE)",
  "College of Business Administration (CBA)",
  "College of Criminal Justice (CJUS)",
  "College of Tourism and Hospitality Management (CTHM)",
  "College of International Hospitality Management (CIHM)"
];

export const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate Student"];

interface UseApplicationFormProps {
  electionId: string;
  userId: string;
  onSuccess?: (candidate?: any) => void;
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
  const [department, setDepartment] = useState<string>("");
  const [yearLevel, setYearLevel] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [isEligible, setIsEligible] = useState(initialEligibility !== undefined ? initialEligibility : true);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(initialEligibilityReason || null);
  const [election, setElection] = useState<Election | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Make these available in the component
  const departments = DLSU_DEPARTMENTS;
  const yearLevels = YEAR_LEVELS;

  useEffect(() => {
    const loadData = async () => {
      try {
        setProfileLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast.error('Failed to load profile data');
        }

        if (profileData) {
          setUserProfile(profileData);
          setName(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim());
          
          // Pre-fill department and year level if available
          if (profileData.department) {
            setDepartment(profileData.department);
          }
          
          if (profileData.year_level) {
            setYearLevel(profileData.year_level);
          }
        } else {
          console.warn("No profile data found for user:", userId);
        }

        // Fetch election details including available positions
        const { data: electionData, error: electionError } = await supabase
          .from('elections')
          .select('*')
          .eq('id', electionId)
          .maybeSingle();

        if (electionError) {
          console.error("Election fetch error:", electionError);
          toast.error('Failed to load election data');
          throw electionError;
        }

        if (electionData) {
          // Validate that status is the expected enum type
          const dbElection: DbElection = {
            ...electionData,
            status: (electionData.status as "upcoming" | "active" | "completed")
          };
          
          // Use the mapper function to convert the DB election to the application Election type
          const mappedElection = mapDbElectionToElection(dbElection);
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
      } finally {
        setProfileLoading(false);
      }
    };

    if (userId && electionId) {
      loadData();
    } else {
      setProfileLoading(false);
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

      if (!bio || bio.trim().length < 10) {
        setValidationError("Bio must be at least 10 characters");
        return;
      }

      if (!department) {
        setValidationError("Department/College is required");
        return;
      }

      if (!yearLevel) {
        setValidationError("Year level is required");
        return;
      }

      // Create the application data
      const applicationData = {
        id: uuidv4(),
        user_id: userId,
        election_id: electionId,
        name,
        position,
        bio: bio.trim(),
        image_url: imageUrl || null,
        status: 'pending' as "pending",
        department,
        year_level: yearLevel
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
    department,
    setDepartment,
    yearLevel,
    setYearLevel,
    departments,
    yearLevels,
    submitting,
    imageUploading,
    setImageUploading,
    availablePositions,
    userProfile,
    validationError,
    isEligible,
    eligibilityReason,
    handleSubmit,
    profileLoading,
  };
};
