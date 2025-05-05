
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/features/auth/context/RoleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { assignRole, removeRole } = useRole();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get all user profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name');
      
      if (error) throw error;

      // For each user, get their roles
      if (profiles) {
        const usersWithRoles = await Promise.all(profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            roles: roleData?.map(r => r.role) || []
          };
        }));
        
        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, role: "admin" | "voter", hasRole: boolean) => {
    try {
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
      
    } catch (error) {
      console.error(`Error toggling ${role} role:`, error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Voter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Button
                          variant={user.roles.includes("admin") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleRole(user.id, "admin", user.roles.includes("admin"))}
                        >
                          {user.roles.includes("admin") ? "Revoke" : "Grant"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.roles.includes("voter") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleRole(user.id, "voter", user.roles.includes("voter"))}
                        >
                          {user.roles.includes("voter") ? "Revoke" : "Grant"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
