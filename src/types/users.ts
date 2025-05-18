
/**
 * DLSU-D User Profile type definition
 */
export interface DlsudProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  studentId?: string;
  department?: string;
  yearLevel?: string;
  isFaculty?: boolean;
  facultyPosition?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps database profile data to app profile object
 */
export const mapDbProfileToProfile = (dbProfile: any): DlsudProfile => ({
  id: dbProfile.id,
  firstName: dbProfile.first_name || '',
  lastName: dbProfile.last_name || '',
  email: dbProfile.email || '',
  imageUrl: dbProfile.image_url,
  studentId: dbProfile.student_id,
  department: dbProfile.department,
  yearLevel: dbProfile.year_level,
  isFaculty: dbProfile.is_faculty || false,
  facultyPosition: dbProfile.faculty_position || '',
  createdAt: dbProfile.created_at,
  updatedAt: dbProfile.updated_at
});
