
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/admin/users/types";
import { useRole } from "@/features/auth/context/RoleContext";
import { canVerifyProfiles } from "@/utils/admin/roleUtils";

export const useOptimizedUserManagement = (
  users: UserProfile[], 
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingUserIds, setProcessingUserIds] = useState<Set<string>>(new Set());
  const { assignRole, removeRole, isAdmin } = useRole();

  const updateUserLocally = (userId: string, updates: Partial<UserProfile>) => {
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const handleVerifyProfile = async (userId: string, isVerified: boolean) => {
    if (processingUserIds.has(userId)) return;
    
    if (!canVerifyProfiles(isAdmin)) {
      toast.error("You don't have permission to verify profiles");
      return;
    }
    
    try {
      setProcessingUserIds(prev => new Set(prev).add(userId));
      
      console.log(`Updating verification status for user ${userId}: setting to ${!isVerified}`);
      
      // Optimistically update the UI first
      const user = users.find(u => u.id === userId);
      if (!user) return;

      let updatedRoles = [...user.roles];
      
      if (!isVerified) {
        // Verifying - add voter role if not present
        if (!user.roles.includes('voter')) {
          updatedRoles.push('voter');
          await assignRole(userId, 'voter');
        }
      } else {
        // Revoking - remove voter role
        if (user.roles.includes('voter')) {
          updatedRoles = updatedRoles.filter(r => r !== 'voter');
          await removeRole(userId, 'voter');
        }
      }
      
      // Update local state immediately
      updateUserLocally(userId, { roles: updatedRoles });
      
      toast.success(
        isVerified 
          ? "Profile verification revoked successfully" 
          : "Profile verified successfully"
      );
      
    } catch (error) {
      console.error("Error updating profile verification:", error);
      toast.error("Failed to update profile verification status");
      
      // Revert optimistic update on error
      const originalUser = users.find(u => u.id === userId);
      if (originalUser) {
        updateUserLocally(userId, { roles: originalUser.roles });
      }
    } finally {
      setTimeout(() => {
        setProcessingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 500);
    }
  };

  const handleToggleRole = async (userId: string, role: string, action: 'add' | 'remove') => {
    if (processingUserIds.has(userId)) return;
    
    try {
      setProcessingUserIds(prev => new Set(prev).add(userId));
      
      // Optimistically update the UI
      const user = users.find(u => u.id === userId);
      if (!user) return;

      let updatedRoles = [...user.roles];
      
      if (action === 'remove') {
        updatedRoles = updatedRoles.filter(r => r !== role);
        await removeRole(userId, role as "admin" | "voter");
      } else {
        if (!updatedRoles.includes(role)) {
          updatedRoles.push(role);
        }
        await assignRole(userId, role as "admin" | "voter");
      }
      
      // Update local state immediately
      updateUserLocally(userId, { roles: updatedRoles });
      
      toast.success(
        action === 'remove' 
          ? `Removed ${role} role successfully` 
          : `Assigned ${role} role successfully`
      );
      
    } catch (error) {
      console.error(`Error toggling ${role} role:`, error);
      toast.error(`Failed to update user role`);
      
      // Revert optimistic update on error
      const originalUser = users.find(u => u.id === userId);
      if (originalUser) {
        updateUserLocally(userId, { roles: originalUser.roles });
      }
    } finally {
      setTimeout(() => {
        setProcessingUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 500);
    }
  };

  const handleBulkVerify = async (userIds: string[], verify: boolean) => {
    if (!canVerifyProfiles(isAdmin)) {
      toast.error("You don't have permission to verify profiles");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const userId of userIds) {
        try {
          const user = users.find(u => u.id === userId);
          if (!user) continue;

          const hasVoterRole = user.roles.includes('voter');
          
          if (verify && !hasVoterRole) {
            await assignRole(userId, 'voter');
            updateUserLocally(userId, { 
              roles: [...user.roles, 'voter'] 
            });
          } else if (!verify && hasVoterRole) {
            await removeRole(userId, 'voter');
            updateUserLocally(userId, { 
              roles: user.roles.filter(r => r !== 'voter') 
            });
          }
          
          successCount++;
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully ${verify ? 'verified' : 'unverified'} ${successCount} user(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} user(s)`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing: isProcessing || processingUserIds.size > 0,
    processingUserIds,
    handleVerifyProfile,
    handleToggleRole,
    handleBulkVerify,
    updateUserLocally
  };
};
