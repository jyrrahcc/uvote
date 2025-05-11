
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
  const { 
    users, 
    setUsers, 
    loading, 
    totalUsers,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    fetchUsers 
  } = useUsersList();
  
  const { user: currentUser } = useAuth();
  const { isProcessing, handleVerifyProfile, handleToggleRole } = useUserManagement(users, setUsers);
  
  const {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    currentTab,
    setCurrentTab,
    verificationFilter,
    setVerificationFilter,
    handleSort,
    filteredUsers
  } = useUserFiltersAndSort(users);

  const {
    confirmDialog,
    setConfirmDialog,
    profileDialogOpen,
    setProfileDialogOpen,
    selectedUser,
    setSelectedUser,
    updateSelectedUser,
    activeUserMenuId,
    openProfileDialog,
    handleRoleAction,
    toggleUserMenu
  } = useUserDialogs();

  // Custom handler for verifying profiles that updates the selectedUser state
  const handleVerifyProfileWithUpdate = async (userId: string, isVerified: boolean) => {
    await handleVerifyProfile(userId, isVerified);
    
    // After verification, update the selectedUser state if they're the one being verified
    if (selectedUser && selectedUser.id === userId) {
      // Find the updated user in the users array
      const updatedUser = users.find(user => user.id === userId);
      if (updatedUser) {
        // Update the selected user with the new data
        setSelectedUser({
          ...updatedUser,
          is_verified: !isVerified // Toggle the verification status
        });
      }
    }
  };

  // Custom handler for toggling roles that updates the selectedUser state  
  const handleToggleRoleWithUpdate = async (userId: string, role: string, action: 'add' | 'remove') => {
    await handleToggleRole(userId, role, action);
    
    // After role change, update the selectedUser state if they're the one being updated
    if (selectedUser && selectedUser.id === userId) {
      // Find the updated user in the users array
      const updatedUser = users.find(user => user.id === userId);
      if (updatedUser) {
        // Update the selected user with the new data
        setSelectedUser(updatedUser);
      }
    }
  };

  return (
    <div className="space-y-6">
      <UsersListHeader
        usersCount={users.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        verificationFilter={verificationFilter}
        onVerificationFilterChange={setVerificationFilter}
      />
      
      <UsersTableContainer
        users={filteredUsers}
        currentUserId={currentUser?.id}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        isProcessing={isProcessing}
        loading={loading}
        totalUsers={totalUsers}
        pageSize={pageSize}
        currentPage={currentPage}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
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
        onVerifyProfile={handleVerifyProfileWithUpdate}
        onCancelRoleDialog={() => setConfirmDialog(prev => ({...prev, open: false}))}
        onConfirmRoleAction={handleToggleRoleWithUpdate}
      />
    </div>
  );
};

export default UsersManagement;
