
/**
 * DLSU-D User Profile interface
 */
export interface DlsudProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  department?: string;
  yearLevel?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database representation of a user profile
 */
export interface DbDlsudProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps database profile to application profile
 */
export const mapDbProfileToProfile = (dbProfile: DbDlsudProfile): DlsudProfile => ({
  id: dbProfile.id,
  firstName: dbProfile.first_name,
  lastName: dbProfile.last_name,
  email: dbProfile.email,
  studentId: dbProfile.student_id,
  department: dbProfile.department,
  yearLevel: dbProfile.year_level,
  imageUrl: dbProfile.image_url,
  createdAt: dbProfile.created_at,
  updatedAt: dbProfile.updated_at
});

/**
 * Maps application profile to database profile
 */
export const mapProfileToDbProfile = (profile: DlsudProfile): DbDlsudProfile => ({
  id: profile.id,
  first_name: profile.firstName,
  last_name: profile.lastName,
  email: profile.email,
  student_id: profile.studentId,
  department: profile.department,
  year_level: profile.yearLevel,
  image_url: profile.imageUrl,
  created_at: profile.createdAt,
  updated_at: profile.updatedAt
});

/**
 * User role type
 */
export type UserRole = 'voter' | 'candidate' | 'officer' | 'admin';

/**
 * User role information
 */
export interface UserRoleInfo {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

/**
 * Database representation of a user role
 */
export interface DbUserRoleInfo {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

/**
 * Maps database user role to application user role
 */
export const mapDbUserRoleToUserRole = (dbUserRole: DbUserRoleInfo): UserRoleInfo => ({
  id: dbUserRole.id,
  userId: dbUserRole.user_id,
  role: dbUserRole.role,
  createdAt: dbUserRole.created_at
});
