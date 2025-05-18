
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useCandidateRegistration } from "../hooks/useCandidateRegistration";
import { candidateFormSchema, type CandidateFormData } from "../schemas/candidateFormSchema";
import PersonalInfoFields from "./form-sections/PersonalInfoFields";
import AcademicInfoFields from "./form-sections/AcademicInfoFields";
import BioField from "./form-sections/BioField";
import PosterUploadField from "./form-sections/PosterUploadField";
import FormActions from "./form-sections/FormActions";

interface CandidateApplicationFormProps {
  electionId: string;
  userId: string;
  onSuccess?: (candidate: any) => void;
  onCancel?: () => void;
  onClose?: () => void;
  onApplicationSubmitted?: () => void;
  isUserEligible?: boolean;
  eligibilityReason?: string | null;
  initialEligibility?: boolean;
  initialEligibilityReason?: string | null;
}

const CandidateApplicationForm = ({ 
  electionId,
  userId,
  onSuccess,
  onCancel,
  onClose,
  onApplicationSubmitted,
  isUserEligible = true,
  eligibilityReason = null,
  initialEligibility,
  initialEligibilityReason
}: CandidateApplicationFormProps) => {
  const { user } = useAuth();
  const { registerCandidate, loading } = useCandidateRegistration({
    electionId,
    userId,
    onSuccess: (candidate) => {
      if (onSuccess) {
        onSuccess(candidate);
      }
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
      if (onClose) {
        onClose();
      }
    }
  });
  
  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: user?.user_metadata?.first_name && user?.user_metadata?.last_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : "",
      bio: "",
      position: "",
      image_url: "",
      student_id: user?.user_metadata?.student_id || "",
      department: user?.user_metadata?.department || "",
      year_level: user?.user_metadata?.year_level || "",
    },
  });

  const handleSubmit = async (values: CandidateFormData) => {
    await registerCandidate(values);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  // Use either the direct props or the initial props for eligibility
  const finalIsEligible = isUserEligible ?? initialEligibility ?? true;
  const finalEligibilityReason = eligibilityReason ?? initialEligibilityReason ?? null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <PersonalInfoFields form={form} />
        <AcademicInfoFields form={form} />
        <BioField form={form} />
        <PosterUploadField form={form} />
        <FormActions loading={loading} onClose={handleCancel} />
      </form>
    </Form>
  );
};

export default CandidateApplicationForm;
