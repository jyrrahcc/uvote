
import { z } from "zod";

export const candidateFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  image_url: z.string().optional(),
  student_id: z.string().optional(),
  department: z.string().min(2, { message: "Department/College is required" }),
  year_level: z.string().min(1, { message: "Year level is required" }),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
