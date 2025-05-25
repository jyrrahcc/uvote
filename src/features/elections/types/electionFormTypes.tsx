
import { z } from "zod";

export const DLSU_DEPARTMENTS = [
  "University-wide",
  "College of Computer Studies",
  "College of Engineering", 
  "College of Business",
  "College of Liberal Arts",
  "College of Science",
  "College of Education",
  "College of Law",
  "School of Economics"
];

export const YEAR_LEVELS = [
  "1st Year",
  "2nd Year", 
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduate",
  "Alumni",
  "Faculty",
  "Staff"
];

export const DEFAULT_POSITIONS = [
  "President",
  "Vice President", 
  "Secretary",
  "Treasurer",
  "Auditor",
  "Public Relations Officer"
];

export const electionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  colleges: z.array(z.string()).min(1, "At least one college must be selected"),
  eligibleYearLevels: z.array(z.string()).min(1, "At least one year level must be selected"),
  candidacyStartDate: z.string().min(1, "Candidacy start date is required"),
  candidacyEndDate: z.string().min(1, "Candidacy end date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isPrivate: z.boolean().default(false),
  accessCode: z.string().optional(),
  positions: z.array(z.string()).min(1, "At least one position is required"),
  banner_urls: z.array(z.string()).default([])
});

export type ElectionFormValues = z.infer<typeof electionFormSchema>;
