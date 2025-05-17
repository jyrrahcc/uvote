
import { supabase } from "@/integrations/supabase/client";
import { CandidateApplication, DbCandidateApplication } from "@/types";

/**
 * Map database application data to CandidateApplication type
 */
export const mapDbCandidateApplicationToCandidateApplication = (
  dbApp: DbCandidateApplication
): CandidateApplication => {
  return {
    id: dbApp.id,
    user_id: dbApp.user_id,
    election_id: dbApp.election_id,
    position: dbApp.position,
    name: dbApp.name,
    bio: dbApp.bio || null,
    image_url: dbApp.image_url || null,
    status: dbApp.status,
    created_at: dbApp.created_at,
    updated_at: dbApp.updated_at,
    feedback: dbApp.feedback || null,
    reviewed_at: dbApp.reviewed_at || null,
    reviewed_by: dbApp.reviewed_by || null,
    student_id: dbApp.student_id || null,
    department: dbApp.department || null,
    year_level: dbApp.year_level || null
  };
};

// Type definition for the enriched application data that includes profile information
export interface ExtendedApplicationData extends DbCandidateApplication {
  profiles?: {
    first_name: string;
    last_name: string;
    department?: string | null;
    year_level?: string | null;
    student_id?: string | null;
  } | null;
}

/**
 * Process application data from database with profiles information
 */
export const processApplicationWithProfile = (application: any): CandidateApplication => {
  const extendedApp = application as unknown as ExtendedApplicationData;
  
  // Create a valid DbCandidateApplication with additional fields from profiles
  const dbApp: DbCandidateApplication = {
    ...extendedApp,
    student_id: extendedApp.student_id || extendedApp.profiles?.student_id || null,
    department: extendedApp.department || extendedApp.profiles?.department || null,
    year_level: extendedApp.year_level || extendedApp.profiles?.year_level || null
  };
  
  return mapDbCandidateApplicationToCandidateApplication(dbApp);
};
