
import { CandidateApplication, mapDbApplicationToApplication } from '@/types/candidates';
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

      return mapDbApplicationToApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }
}
