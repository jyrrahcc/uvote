
import { CandidateApplication, mapApplicationToDbApplication } from '@/types/candidates';
import { supabase } from '@/integrations/supabase/client';

export class ApplicationBaseService {
  /**
   * Fetches a single application by ID
   */
  static async getApplicationById(applicationId: string): Promise<CandidateApplication | null> {
    try {
      const { data, error } = await supabase
        .from('candidate_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        electionId: data.election_id,
        userId: data.user_id,
        name: data.name,
        position: data.position,
        bio: data.bio || '',
        imageUrl: data.image_url,
        studentId: data.student_id,
        department: data.department,
        yearLevel: data.year_level,
        isFaculty: data.is_faculty || false,
        facultyPosition: data.faculty_position,
        status: data.status as 'pending' | 'approved' | 'rejected' | 'disqualified',
        feedback: data.feedback,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewedBy: data.reviewed_by,
        reviewedAt: data.reviewed_at
      };
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }
}
