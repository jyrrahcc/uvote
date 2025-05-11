
import React from "react";
import { UserProfile } from "@/components/admin/users/types";
import UserProfileDialog from "@/components/admin/users/UserProfileDialog";
import RoleConfirmDialog from "@/components/admin/users/RoleConfirmDialog";

interface UserDialogsProps {
  profileDialogOpen: boolean;
  selectedUser: UserProfile | null;
  isProcessing: boolean;
  confirmDialog: {
    open: boolean;
    userId: string;
    role: string;
    action: 'add' | 'remove';
  };
  onCloseProfileDialog: () => void;
  onVerifyProfile: (userId: string, isVerified: boolean) => Promise<void>;
  onCancelRoleDialog: () => void;
  onConfirmRoleAction: (userId: string, role: string, action: 'add' | 'remove') => Promise<void>;
}

export const UserDialogs: React.FC<UserDialogsProps> = ({
  profileDialogOpen,
  selectedUser,
  isProcessing,
  confirmDialog,
  onCloseProfileDialog,
  onVerifyProfile,
  onCancelRoleDialog,
  onConfirmRoleAction
}) => {
  const handleVerifyProfile = async (userId: string, isVerified: boolean) => {
    console.log("UserDialogs - handleVerifyProfile:", userId, isVerified);
    await onVerifyProfile(userId, isVerified);
  };
  
  return (
    <>
      {/* Profile Dialog */}
      {selectedUser && (
        <UserProfileDialog
          open={profileDialogOpen}
          onClose={onCloseProfileDialog}
          selectedUser={selectedUser}
          onVerifyProfile={handleVerifyProfile}
          isProcessing={isProcessing}
        />
      )}

      {/* Role Assignment Dialog */}
      <RoleConfirmDialog
        isOpen={confirmDialog.open}
        userId={confirmDialog.userId}
        role={confirmDialog.role}
        action={confirmDialog.action}
        isProcessing={isProcessing}
        onCancel={onCancelRoleDialog}
        onConfirm={onConfirmRoleAction}
      />
    </>
  );
};
