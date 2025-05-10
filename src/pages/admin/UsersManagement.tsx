
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { canVerifyProfiles } from "@/utils/admin/roleUtils";
import UserList from "@/components/admin/users/UserList";
import UserProfileDialog from "@/components/admin/users/UserProfileDialog";
import RoleConfirmDialog from "@/components/admin/users/RoleConfirmDialog";
import UserSearchAndFilters from "@/components/admin/users/UserSearchAndFilters";
import { UserProfile } from "@/components/admin/users/types";
import UserMenuDropdown from "@/components/admin/users/UserMenuDropdown";
import { useUserManagement } from "@/hooks/useUserManagement";

const UsersManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentTab, setCurrentTab] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean, userId: string, role: string, action: 'add'|'remove'}>({
    open: false,
    userId: "",
    role: "",
    action: "add"
  });
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeUserMenuId, setActiveUserMenuId] = useState<string | null>(null);
  
  const { isAdmin } = useRole();
  const { user: currentUser } = useAuth();
  const { isProcessing, handleVerifyProfile, handleToggleRole } = useUserManagement(users, setUsers);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get all user profiles with more detailed information, but avoid requesting image_url since it doesn't exist
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, student_id, department, year_level, is_verified');
      
      if (error) {
        throw error;
      }

      if (!profiles) {
        setUsers([]);
        return;
      }

      // For each user, get their roles
      const usersWithRoles = await Promise.all(profiles.map(async (profile) => {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id);
        
        // Set default image placeholder
        return {
          ...profile,
          image_url: null, // Add a null or empty image_url since it's expected in the UserProfile type
          roles: roleData?.map(r => r.role) || []
        };
      }));
      
      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
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

  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };
  
  const openProfileDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setProfileDialogOpen(true);
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.student_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (currentTab === 'all') return matchesSearch;
      if (currentTab === 'admins') return matchesSearch && user.roles.includes('admin');
      if (currentTab === 'voters') return matchesSearch && user.roles.includes('voter');
      
      return matchesSearch;
    })
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      
      if (sortColumn === "name") {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB) * direction;
      }
      
      if (sortColumn === "email") {
        return a.email.localeCompare(b.email) * direction;
      }
      
      if (sortColumn === "created_at") {
        return new Date(a.created_at).getTime() > new Date(b.created_at).getTime() 
          ? direction 
          : -direction;
      }
      
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage users and their roles in the system
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {users.length} user{users.length !== 1 ? 's' : ''} registered
              </CardDescription>
            </div>
            
            <UserSearchAndFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : (
            <UserList 
              users={filteredUsers}
              currentUserId={currentUser?.id}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              isProcessing={isProcessing}
              onSort={handleSort}
              onViewProfile={openProfileDialog}
              onToggleMenu={toggleUserMenu}
            />
          )}
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      {selectedUser && (
        <UserProfileDialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
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
        onCancel={() => setConfirmDialog(prev => ({...prev, open: false}))}
        onConfirm={handleToggleRole}
      />
    </div>
  );
};

export default UsersManagement;
