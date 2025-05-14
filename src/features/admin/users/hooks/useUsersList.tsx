
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/admin/users/types";

export const useUsersList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get total count of users (for pagination)
  const fetchUserCount = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      setTotalUsers(count || 0);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const fetchUsers = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      
      // Calculate range start for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Get all user profiles with more detailed information
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, student_id, department, year_level, image_url')
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      if (!profiles) {
        setUsers([]);
        return;
      }

      console.log("Fetched profiles:", profiles);

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
      
      console.log("Users with roles:", usersWithRoles);
      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function to reload user data
  const refreshUsers = () => {
    fetchUserCount();
    fetchUsers(currentPage, pageSize);
  };

  useEffect(() => {
    fetchUserCount();
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  return {
    users,
    setUsers,
    loading,
    fetchUsers,
    refreshUsers,
    totalUsers,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage
  };
};
