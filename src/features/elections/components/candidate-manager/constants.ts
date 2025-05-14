
// Re-export the constants from the electionFormTypes.ts for consistency
export { 
  DEFAULT_POSITIONS, 
  DLSU_DEPARTMENTS, 
  YEAR_LEVELS 
} from "../../types/electionFormTypes";

// Application statuses
export const APPLICATION_STATUSES = [
  "pending",
  "approved",
  "rejected"
];

// Define fallback values for empty strings
export const UNKNOWN_DEPARTMENT = "unknown-department";
export const UNKNOWN_YEAR = "unknown-year";
export const UNKNOWN_POSITION = "unknown-position";
