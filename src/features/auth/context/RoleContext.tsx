
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type UserRole = "admin" | "voter";

type RoleContextType = {
  userRole: UserRole | null;
  isAdmin: boolean;
  isVoter: boolean;
  loading: boolean;
  checkRole: (role: UserRole) => boolean;
  assignRole: (userId: string, role: UserRole) => Promise<void>;
  removeRole: (userId: string, role: UserRole) => Promise<void>;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedVerification, setHasCheckedVerification] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        setHasCheckedVerification(false);
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
          
          // Only check profile verification once per session
          if (!hasCheckedVerification) {
            setHasCheckedVerification(true);
            
            // Check if user profile is verified
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_verified')
              .eq('id', user.id)
              .single();
              
            if (profileError) {
              console.error("Error checking user profile:", profileError);
            } else if (profileData && profileData.is_verified) {
              // If profile is verified but user doesn't have voter role, assign it
              await assignRole(user.id, 'voter');
              setUserRole('voter');
              toast.success("Your account has been verified. You now have voter privileges.");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        toast.error("Failed to fetch user role. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const checkRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    if (role === 'admin') return userRole === 'admin';
    return true; // If checking for 'voter', both 'admin' and 'voter' can access
  };

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      // Check if admin is assigning the role or it's a system assignment for verified users
      const isAdminAction = userRole === 'admin';
      
      // For admin users, we check permission first
      if (role === 'admin' && !isAdminAction) {
        toast.error("You don't have permission to assign admin role");
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
      
      if (isAdminAction) {
        toast.success(`User assigned ${role} role successfully`);
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      if (userRole === 'admin') {
        toast.error("Failed to assign role. Please try again.");
      }
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
      
      // If removing voter role, also update profile to set is_verified to false
      if (role === 'voter') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_verified: false })
          .eq('id', userId);
          
        if (profileError) {
          console.error("Error updating profile verification status:", profileError);
          toast.error("Role removed but failed to update verification status");
          return;
        }
      }
      
      toast.success(`User's ${role} role removed successfully`);
      
      // Reset verification check flag if the current user's role was removed
      if (userId === user?.id) {
        setHasCheckedVerification(false);
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
