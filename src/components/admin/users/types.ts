
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  is_verified?: boolean;  // Added back as optional
  roles: string[];
  created_at: string;
  image_url?: string | null;  // Updated to be optional and accept null
}
