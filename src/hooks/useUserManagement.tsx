
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/admin/users/types";
import { useRole } from "@/features/auth/context/RoleContext";
import { canVerifyProfiles } from "@/utils/admin/roleUtils";

export const useUserManagement = (users: UserProfile[], setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { assignRole, removeRole, isAdmin } = useRole();

  const handleVerifyProfile = async (userId: string, isVerified: boolean) => {
    if (isProcessing) return;
    
    // Check if user has admin permission to verify profiles
    if (!canVerifyProfiles(isAdmin)) {
      toast.error("You don't have permission to verify profiles");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Update profile verification status
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: !isVerified,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // If verifying, assign voter role if not already assigned
      if (!isVerified) {
        const user = users.find(u => u.id === userId);
        if (user && !user.roles.includes('voter')) {
          await assignRole(userId, 'voter');
        }
      } 
      // If revoking verification, remove voter role
      else {
        const user = users.find(u => u.id === userId);
        if (user && user.roles.includes('voter')) {
          await removeRole(userId, 'voter');
        }
      }
      
      // Update local state
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === userId) {
          const updatedUser = { 
            ...user, 
            is_verified: !isVerified 
          };
          
          // If verifying, add voter role if not present
          if (!isVerified && !user.roles.includes('voter')) {
            updatedUser.roles = [...user.roles, 'voter'];
          }
          // If revoking, remove voter role
          else if (isVerified && user.roles.includes('voter')) {
            updatedUser.roles = user.roles.filter(r => r !== 'voter');
          }
          
          return updatedUser;
        }
        return user;
      }));
      
      toast.success(
        isVerified 
          ? "Profile verification revoked and voter role removed successfully" 
          : "Profile verified and voter role assigned successfully"
      );
      
    } catch (error) {
      console.error("Error updating profile verification:", error);
      toast.error("Failed to update profile verification status");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleToggleRole = async (userId: string, role: "admin" | "voter", hasRole: boolean) => {
    if (isProcessing) return; // Prevent multiple clicks
    
    try {
      setIsProcessing(true);
      
      if (hasRole) {
        await removeRole(userId, role);
      } else {
        await assignRole(userId, role);
      }
      
      // Update local state
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === userId) {
          let updatedRoles = [...user.roles];
          if (hasRole) {
            updatedRoles = updatedRoles.filter(r => r !== role);
          } else if (!updatedRoles.includes(role)) {
            updatedRoles.push(role);
          }
          return { ...user, roles: updatedRoles };
        }
        return user;
      }));
      
      toast.success(
        hasRole 
          ? `Removed ${role} role successfully` 
          : `Assigned ${role} role successfully`
      );
      
    } catch (error) {
      console.error(`Error toggling ${role} role:`, error);
      toast.error(`Failed to update user role`);
    } finally {
      // Add a small delay before enabling interactions again
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  return {
    isProcessing,
    handleVerifyProfile,
    handleToggleRole
  };
};
