
import { z } from "zod";

export const candidateFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
  student_id: z.string().optional(),
  department: z.string().optional(),
  year_level: z.string().optional(),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
