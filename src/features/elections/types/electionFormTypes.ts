
import * as z from "zod";

/**
 * Form validation schema with date validations
 */
export const electionFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  departments: z.array(z.string()).min(1, "At least one department must be selected"),
  eligibleYearLevels: z.array(z.string()).default([]),
  candidacyStartDate: z.string().min(1, "Candidacy start date is required"),
  candidacyEndDate: z.string().min(1, "Candidacy end date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isPrivate: z.boolean().default(false),
  accessCode: z.string().optional()
    .refine(val => {
      // Only validate access code if isPrivate is true
      if (val === undefined) return true;
      return true;
    }),
  restrictVoting: z.boolean().default(false),
  positions: z.array(z.string()).default([]),
  banner_urls: z.array(z.string()).default([]),
}).refine((data) => {
  // Candidacy period should come before voting period
  const candidacyStart = new Date(data.candidacyStartDate);
  const candidacyEnd = new Date(data.candidacyEndDate); 
  const votingStart = new Date(data.startDate);
  
  return candidacyEnd <= votingStart;
}, {
  message: "Candidacy period must end before the voting period starts",
  path: ["candidacyEndDate"],
}).refine((data) => {
  // Candidacy start should be before candidacy end
  const candidacyStart = new Date(data.candidacyStartDate);
  const candidacyEnd = new Date(data.candidacyEndDate);
  
  return candidacyStart < candidacyEnd;
}, {
  message: "Candidacy start date must be before candidacy end date",
  path: ["candidacyEndDate"],
}).refine((data) => {
  // Voting start should be before voting end
  const votingStart = new Date(data.startDate);
  const votingEnd = new Date(data.endDate);
  
  return votingStart < votingEnd;
}, {
  message: "Voting start date must be before voting end date",
  path: ["endDate"],
});

export type ElectionFormValues = z.infer<typeof electionFormSchema>;

// College departments for DLSU-D
export const DLSU_DEPARTMENTS = [
  "College of Business Administration and Accountancy",
  "College of Education",
  "College of Engineering, Architecture and Technology",
  "College of Humanities, Arts and Social Sciences",
  "College of Science",
  "College of Information and Computer Studies",
  "College of Criminal Justice Education",
  "College of Tourism and Hospitality Management",
  "University-wide"
];

// Year levels
export const YEAR_LEVELS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Graduate Student",
  "All Year Levels"
];

// Default positions available for elections
export const DEFAULT_POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Public Relations Officer",
  "Senator",
  "Governor",
  "Department Representative"
];
