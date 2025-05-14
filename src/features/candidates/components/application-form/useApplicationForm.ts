
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UNKNOWN_DEPARTMENT, UNKNOWN_YEAR, UNKNOWN_POSITION } from "@/features/elections/components/candidate-manager/constants";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/features/elections/components/candidate-manager/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const applicationFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  student_id: z.string().regex(/^[0-9]{8}$/, { message: "Student ID must be 8 digits." }),
  position: z.string().min(1, { message: "Please select a position." }),
  department: z.string().refine(value => DLSU_DEPARTMENTS.includes(value), {
    message: "Please select a valid department.",
  }),
  year_level: z.string().refine(value => YEAR_LEVELS.includes(value), {
    message: "Please select a valid year level.",
  }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  image_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface UseApplicationFormProps {
  electionId: string;
  userId: string;
  onSuccess: (candidate?: any) => void;
  onApplicationSubmitted?: () => void;
  onClose?: () => void;
  initialEligibility?: boolean;
  initialEligibilityReason?: string | null;
}

interface UserProfile {
  student_id?: string;
  department?: string;
  year_level?: string;
  first_name?: string;
  last_name?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState<boolean>(initialEligibility ?? true);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(initialEligibilityReason ?? null);
  const [profileLoading, setProfileLoading] = useState(true);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: "",
      student_id: "",
      position: "",
      department: UNKNOWN_DEPARTMENT,
      year_level: UNKNOWN_YEAR,
      bio: "",
      image_url: "",
    },
  });
  
  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('student_id, department, year_level, first_name, last_name')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        
        // Pre-fill form with user data if available
        if (data) {
          if (data.student_id) form.setValue('student_id', data.student_id);
          if (data.department) form.setValue('department', data.department || UNKNOWN_DEPARTMENT);
          if (data.year_level) form.setValue('year_level', data.year_level || UNKNOWN_YEAR);
          
          // Set name from first and last name
          const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
          if (fullName) {
            setName(fullName);
            form.setValue('name', fullName);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    }
    
    // Fetch available positions for the election
    async function fetchPositions() {
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('positions')
          .eq('id', electionId)
          .single();
          
        if (error) {
          console.error("Error fetching positions:", error);
          return;
        }
        
        if (data && data.positions && Array.isArray(data.positions)) {
          const positionsWithFallback = data.positions.map(p => p || UNKNOWN_POSITION);
          setAvailablePositions(positionsWithFallback);
        } else {
          setAvailablePositions([]);
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    }
    
    fetchUserProfile();
    fetchPositions();
  }, [userId, electionId, form]);

  const onSubmit: SubmitHandler<ApplicationFormValues> = async (data) => {
    setIsSubmitting(true);
    setValidationError(null);
    
    try {
      const response = await fetch('/api/applications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          election_id: electionId,
          user_id: userId,
          image_url: imageUrl,
        }),
      });

      if (response.ok) {
        toast.success("Application submitted successfully");
        
        if (onApplicationSubmitted) {
          onApplicationSubmitted();
        } else {
          onSuccess();
        }
        
        if (onClose) onClose();
      } else {
        const errorData = await response.json();
        setValidationError(errorData.message || "Failed to register. Please try again.");
      }
    } catch (error: any) {
      setValidationError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Wrapper for form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return {
    form,
    onSubmit,
    isSubmitting,
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
    submitting: isSubmitting,
    imageUploading,
    setImageUploading,
    availablePositions,
    userProfile,
    validationError,
    isEligible,
    eligibilityReason,
    handleSubmit,
    profileLoading
  };
};
