
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Developer } from "../types/developerTypes";

export const useDevelopers = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching developers:', error);
        toast.error('Failed to load developers');
        return;
      }

      setDevelopers(data || []);
    } catch (error) {
      console.error('Error fetching developers:', error);
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (developerId: string) => {
    try {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', developerId);

      if (error) {
        console.error('Error deleting developer:', error);
        toast.error('Failed to delete developer');
        return;
      }

      toast.success('Developer deleted successfully');
      fetchDevelopers();
    } catch (error) {
      console.error('Error deleting developer:', error);
      toast.error('Failed to delete developer');
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  return {
    developers,
    loading,
    fetchDevelopers,
    handleDelete,
  };
};
