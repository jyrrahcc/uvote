
import { useAuth } from "@/features/auth/context/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUsersList } from "@/features/admin/users/hooks/useUsersList";
import { useUserFiltersAndSort } from "@/features/admin/users/hooks/useUserFiltersAndSort";
import { useUserDialogs } from "@/features/admin/users/hooks/useUserDialogs";
import { UsersListHeader } from "@/features/admin/users/components/UsersListHeader";
import { UsersTableContainer } from "@/features/admin/users/components/UsersTableContainer";
import { UserDialogs } from "@/features/admin/users/components/UserDialogs";

const UsersManagement = () => {
  // Custom hooks
  const { users, setUsers } = useUsersList();
  const { user: currentUser } = useAuth();
  const { isProcessing, handleVerifyProfile, handleToggleRole } = useUserManagement(users, setUsers);
  
  const {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    currentTab,
    setCurrentTab,
    handleSort,
    filteredUsers
  } = useUserFiltersAndSort(users);

  const {
    confirmDialog,
    setConfirmDialog,
    profileDialogOpen,
    setProfileDialogOpen,
    selectedUser,
    openProfileDialog,
    handleRoleAction,
    toggleUserMenu
  } = useUserDialogs();

  return (
    <div className="space-y-6">
      <UsersListHeader
        usersCount={users.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      
      <UsersTableContainer
        users={filteredUsers}
        currentUserId={currentUser?.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        isProcessing={isProcessing}
        loading={false}
        onSort={handleSort}
        onViewProfile={openProfileDialog}
        onToggleMenu={toggleUserMenu}
      />

      <UserDialogs
        profileDialogOpen={profileDialogOpen}
        selectedUser={selectedUser}
        isProcessing={isProcessing}
        confirmDialog={confirmDialog}
        onCloseProfileDialog={() => setProfileDialogOpen(false)}
        onVerifyProfile={handleVerifyProfile}
        onCancelRoleDialog={() => setConfirmDialog(prev => ({...prev, open: false}))}
        onConfirmRoleAction={handleToggleRole}
      />
    </div>
  );
};

export default UsersManagement;
