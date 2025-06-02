
import { useAuth } from "@/features/auth/context/AuthContext";
import { useOptimizedUserManagement } from "@/hooks/useOptimizedUserManagement";
import { useUsersList } from "@/features/admin/users/hooks/useUsersList";
import { useUserFiltersAndSort } from "@/features/admin/users/hooks/useUserFiltersAndSort";
import { useUserDialogs } from "@/features/admin/users/hooks/useUserDialogs";
import { UsersListHeader } from "@/features/admin/users/components/UsersListHeader";
import { UsersTableContainer } from "@/features/admin/users/components/UsersTableContainer";
import { UserDialogs } from "@/features/admin/users/components/UserDialogs";
import BulkActions from "@/components/admin/users/BulkActions";
import { useState } from "react";
import { toast } from "sonner";

const UsersManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
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
    fetchUsers,
    refreshUsers
  } = useUsersList();
  
  const { user: currentUser } = useAuth();
  const { 
    isProcessing, 
    processingUserIds, 
    handleVerifyProfile, 
    handleToggleRole, 
    handleBulkVerify 
  } = useOptimizedUserManagement(users, setUsers);
  
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

  // Custom handler for verifying profiles with optimized updates
  const handleVerifyProfileOptimized = async (userId: string, isVerified: boolean) => {
    console.log("UsersManagement - handleVerifyProfileOptimized:", userId, isVerified);
    await handleVerifyProfile(userId, isVerified);
    
    // Update selectedUser if they're the one being verified
    if (selectedUser && selectedUser.id === userId) {
      const updatedUser = users.find(user => user.id === userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  };

  // Custom handler for toggling roles with optimized updates
  const handleToggleRoleOptimized = async (userId: string, role: string, action: 'add' | 'remove') => {
    await handleToggleRole(userId, role, action);
    
    // Update selectedUser if they're the one being updated
    if (selectedUser && selectedUser.id === userId) {
      const updatedUser = users.find(user => user.id === userId);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  };

  const handleExportSelected = (userIds: string[]) => {
    const selectedUsersData = users.filter(u => userIds.includes(u.id));
    const csvContent = [
      ['Name', 'Email', 'Department', 'Year Level', 'Roles', 'Student ID', 'Created At'].join(','),
      ...selectedUsersData.map(user => [
        `"${user.first_name} ${user.last_name}"`,
        user.email,
        user.department || '',
        user.year_level || '',
        user.roles.join(';'),
        user.student_id || '',
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedUsersData.length} users to CSV`);
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
      
      <BulkActions
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        users={filteredUsers}
        onBulkVerify={handleBulkVerify}
        onExport={handleExportSelected}
        isProcessing={isProcessing}
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
        onVerify={handleVerifyProfileOptimized}
        onRoleAction={handleToggleRoleOptimized}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        processingUserIds={processingUserIds}
      />

      <UserDialogs
        profileDialogOpen={profileDialogOpen}
        selectedUser={selectedUser}
        isProcessing={isProcessing}
        confirmDialog={confirmDialog}
        onCloseProfileDialog={() => setProfileDialogOpen(false)}
        onVerifyProfile={handleVerifyProfileOptimized}
        onCancelRoleDialog={() => setConfirmDialog(prev => ({...prev, open: false}))}
        onConfirmRoleAction={handleToggleRoleOptimized}
      />
    </div>
  );
};

export default UsersManagement;
