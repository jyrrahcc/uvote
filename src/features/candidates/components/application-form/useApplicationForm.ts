import { useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UNKNOWN_DEPARTMENT, UNKNOWN_YEAR, UNKNOWN_POSITION } from "@/features/elections/components/candidate-manager/constants";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "@/features/elections/components/candidate-manager/constants";

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
  image_url: z.string().url({ message: "Please enter a valid URL." }),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

interface UseApplicationFormProps {
  electionId: string;
  userId: string;
  onSuccess: () => void;
}

export const useApplicationForm = ({ electionId, userId, onSuccess }: UseApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit: SubmitHandler<ApplicationFormValues> = async (data) => {
    setIsSubmitting(true);
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
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        form.setError("root", { message: errorData.message || "Failed to register. Please try again." });
      }
    } catch (error: any) {
      form.setError("root", { message: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting };
};
