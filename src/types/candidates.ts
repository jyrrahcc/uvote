
/**
 * Candidate Application type definition
 */
export interface CandidateApplication {
  id: string;
  electionId: string;
  userId: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  studentId?: string;
  department?: string;
  yearLevel?: string;
  isFaculty?: boolean;
  facultyPosition?: string;
  status: 'pending' | 'approved' | 'rejected' | 'disqualified';
  feedback?: string;
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

/**
 * Maps database application data to app candidate application object
 */
export const mapDbApplicationToApplication = (dbApplication: any): CandidateApplication => ({
  id: dbApplication.id,
  electionId: dbApplication.election_id,
  userId: dbApplication.user_id,
  name: dbApplication.name,
  position: dbApplication.position,
  bio: dbApplication.bio || '',
  imageUrl: dbApplication.image_url,
  studentId: dbApplication.student_id,
  department: dbApplication.department,
  yearLevel: dbApplication.year_level,
  isFaculty: dbApplication.is_faculty || false,
  facultyPosition: dbApplication.faculty_position,
  status: dbApplication.status || 'pending',
  feedback: dbApplication.feedback,
  createdAt: dbApplication.created_at,
  updatedAt: dbApplication.updated_at,
  reviewedBy: dbApplication.reviewed_by,
  reviewedAt: dbApplication.reviewed_at
});

/**
 * Maps application data to database format
 */
export const mapApplicationToDbApplication = (application: CandidateApplication): any => ({
  id: application.id,
  election_id: application.electionId,
  user_id: application.userId,
  name: application.name,
  position: application.position,
  bio: application.bio,
  image_url: application.imageUrl,
  student_id: application.studentId,
  department: application.department,
  year_level: application.yearLevel,
  is_faculty: application.isFaculty,
  faculty_position: application.facultyPosition,
  status: application.status,
  feedback: application.feedback,
  created_at: application.createdAt,
  updated_at: application.updatedAt,
  reviewed_by: application.reviewedBy,
  reviewed_at: application.reviewedAt
});

// Define the database application type for internal usage
export interface DbCandidateApplication {
  id: string;
  election_id: string;
  user_id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  is_faculty?: boolean;
  faculty_position?: string;
  status: 'pending' | 'approved' | 'rejected' | 'disqualified';
  feedback?: string;
  created_at: string;
  updated_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}
