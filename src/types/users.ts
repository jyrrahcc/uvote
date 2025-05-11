
/**
 * User type definition
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  studentId?: string; // Added student ID field for DLSU-D context
  department?: string; // Added department field for DLSU-D context
  yearLevel?: string; // Added year level field for DLSU-D context
}

/**
 * DLSU-D Voter type definition
 */
export interface DlsudVoter {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  yearLevel: string;
}

/**
 * Supabase Profile type definition for DLSU-D
 */
export interface DlsudProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  is_verified?: boolean;
  image_url?: string;
}

/**
 * Maps database voter data to app voter object
 */
export const mapDbVoterToVoter = (dbVoter: any): DlsudVoter => ({
  id: dbVoter.id,
  userId: dbVoter.user_id,
  studentId: dbVoter.student_id,
  firstName: dbVoter.first_name,
  lastName: dbVoter.last_name,
  email: dbVoter.email,
  department: dbVoter.department,
  yearLevel: dbVoter.year_level
});

/**
 * Maps database profile to app profile object
 */
export const mapDbProfileToProfile = (profile: any): DlsudProfile => ({
  id: profile.id,
  email: profile.email,
  first_name: profile.first_name,
  last_name: profile.last_name,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
  student_id: profile.student_id || '',
  department: profile.department || '',
  year_level: profile.year_level || '',
  is_verified: profile.is_verified || false,
  image_url: profile.image_url || undefined
});
