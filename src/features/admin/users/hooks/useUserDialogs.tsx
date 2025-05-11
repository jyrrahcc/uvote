
import { useState } from "react";
import { UserProfile } from "@/components/admin/users/types";

export const useUserDialogs = () => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    role: string;
    action: 'add' | 'remove';
  }>({
    open: false,
    userId: "",
    role: "",
    action: "add"
  });
  
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeUserMenuId, setActiveUserMenuId] = useState<string | null>(null);

  // This updated function will be used to open the profile dialog and set the selected user
  const openProfileDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setProfileDialogOpen(true);
  };

  // New function to update the selectedUser state when their properties change
  const updateSelectedUser = (updatedUser: UserProfile) => {
    setSelectedUser(updatedUser);
  };

  const handleRoleAction = (userId: string, role: string, action: 'add' | 'remove') => {
    setConfirmDialog({
      open: true,
      userId,
      role,
      action
    });
  };

  const toggleUserMenu = (userId: string) => {
    setActiveUserMenuId(prevId => prevId === userId ? null : userId);
  };

  return {
    confirmDialog,
    setConfirmDialog,
    profileDialogOpen,
    setProfileDialogOpen,
    selectedUser,
    setSelectedUser,
    updateSelectedUser, // Export the new function
    activeUserMenuId,
    setActiveUserMenuId,
    openProfileDialog,
    handleRoleAction,
    toggleUserMenu
  };
};
