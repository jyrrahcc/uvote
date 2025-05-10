
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  is_verified?: boolean;
  roles: string[];
  created_at: string;
}
