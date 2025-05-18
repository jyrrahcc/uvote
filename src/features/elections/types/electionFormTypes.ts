
import { z } from "zod";

// Default positions that can be selected
export const DEFAULT_POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer", 
  "Auditor",
  "Public Relations Officer"
];

// Election form schema for validation
export const electionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  colleges: z.array(z.string()),
  eligibleYearLevels: z.array(z.string()),
  candidacyStartDate: z.string().min(1, "Candidacy start date is required"),
  candidacyEndDate: z.string().min(1, "Candidacy end date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isPrivate: z.boolean(),
  accessCode: z.string().optional(),
  positions: z.array(z.string()).min(1, "At least one position is required"),
  banner_urls: z.array(z.string()).optional(),
  allowFaculty: z.boolean().optional(),
});

// Type definition inferred from the schema
export type ElectionFormValues = z.infer<typeof electionFormSchema>;
