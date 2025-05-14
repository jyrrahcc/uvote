
import { supabase } from "@/integrations/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type UserRole = "admin" | "voter";

type RoleContextType = {
  userRole: UserRole | null;
  isAdmin: boolean;
  isVoter: boolean;
  loading: boolean;
  checkRole: (role: UserRole) => boolean;
  assignRole: (userId: string, role: UserRole) => Promise<void>;
  removeRole: (userId: string, role: UserRole) => Promise<void>;
  refreshUserRole: () => Promise<void>;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First check if user is admin
      const { data: adminData, error: adminError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (adminError) {
        throw adminError;
      }

      if (adminData) {
        setUserRole('admin');
        setLoading(false);
        return;
      }

      // Then check if user is voter
      const { data: voterData, error: voterError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'voter'
      });
      
      if (voterError) {
        throw voterError;
      }

      if (voterData) {
        setUserRole('voter');
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast.error("Failed to fetch user role. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const refreshUserRole = async () => {
    return fetchUserRole();
  };

  const checkRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    if (role === 'admin') return userRole === 'admin';
    return userRole === 'admin' || userRole === 'voter'; // Both admin and voter can access voter-protected routes
  };

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      // Check if admin is assigning the role
      const isAdminAction = userRole === 'admin';
      
      // For admin users, we check permission first
      if (!isAdminAction) {
        toast.error("You don't have permission to assign roles");
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
      
      toast.success(`User assigned ${role} role successfully`);
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role. Please try again.");
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    if (!checkRole('admin')) {
      toast.error("You don't have permission to remove roles");
      return;
    }

    try {
      // First remove the role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
      
      // Code block that updated profiles table has been removed
      
      toast.success(`User's ${role} role removed successfully`);
      
      // Update local state if current user's role was removed
      if (userId === user?.id && role === userRole) {
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role. Please try again.");
    }
  };

  return (
    <RoleContext.Provider
      value={{
        userRole,
        isAdmin: userRole === 'admin',
        isVoter: userRole === 'voter' || userRole === 'admin',
        loading,
        checkRole,
        assignRole,
        removeRole,
        refreshUserRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
