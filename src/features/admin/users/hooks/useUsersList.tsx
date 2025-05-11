
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/admin/users/types";

export const useUsersList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all user profiles with more detailed information
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, student_id, department, year_level, is_verified, image_url');
      
      if (error) {
        throw error;
      }

      if (!profiles) {
        setUsers([]);
        return;
      }

      // For each user, get their roles
      const usersWithRoles = await Promise.all(profiles.map(async (profile) => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id);
        
        return {
          ...profile,
          roles: roleData?.map(r => r.role) || []
        };
      }));
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    setUsers,
    loading,
    fetchUsers
  };
};
