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
import { 
  Button
} from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  Shield, 
  UserX, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX,
  ArrowUpDown,
  UserCog
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  created_at: string;
}

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
  
  const { assignRole, removeRole } = useRole();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get all user profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at');
      
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
      setConfirmDialog({
        open: false,
        userId: "",
        role: "",
        action: "add"
      });
      
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
    }
  };

  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (currentTab === 'all') return matchesSearch;
      if (currentTab === 'admins') return matchesSearch && user.roles.includes('admin');
      if (currentTab === 'voters') return matchesSearch && user.roles.includes('voter') && !user.roles.includes('admin');
      
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

  // Get user initials
  const getUserInitials = (first_name?: string, last_name?: string, email?: string) => {
    if (first_name && last_name) {
      return `${first_name.charAt(0)}${last_name.charAt(0)}`;
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

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
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="admins">Admins</TabsTrigger>
                  <TabsTrigger value="voters">Voters</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortColumn === "name" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        {sortColumn === "email" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <TableRow key={user.id} className={cn(
                        user.id === currentUser?.id && "bg-muted/50"
                      )}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getUserInitials(user.first_name, user.last_name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              {user.id === currentUser?.id && (
                                <Badge variant="outline" className="text-xs bg-primary/5 text-primary/80">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {user.roles.includes('admin') && (
                              <HoverCard>
                                <HoverCardTrigger>
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </Badge>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-48">
                                  <p className="text-xs">Admin users can manage all aspects of the platform including elections and users.</p>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                            {user.roles.includes('voter') && (
                              <HoverCard>
                                <HoverCardTrigger>
                                  <Badge variant="outline">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Voter
                                  </Badge>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-48">
                                  <p className="text-xs">Voters can participate in elections and view results.</p>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                            {user.roles.length === 0 && (
                              <Badge variant="outline" className="text-muted-foreground">
                                No roles
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.id !== currentUser?.id ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <UserCog className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {user.roles.includes("admin") ? (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      userId: user.id,
                                      role: "admin",
                                      action: "remove"
                                    })}
                                  >
                                    <ShieldX className="mr-2 h-4 w-4" />
                                    Remove Admin Role
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      userId: user.id,
                                      role: "admin",
                                      action: "add"
                                    })}
                                  >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                
                                {user.roles.includes("voter") ? (
                                  <DropdownMenuItem
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      userId: user.id,
                                      role: "voter",
                                      action: "remove"
                                    })}
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Remove Voter Role
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => setConfirmDialog({
                                      open: true,
                                      userId: user.id,
                                      role: "voter",
                                      action: "add"
                                    })}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Make Voter
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Badge variant="outline" className="bg-primary-foreground/5">
                              Current User
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({...prev, open}))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'add' ? (
                <>
                  {confirmDialog.role === 'admin' ? (
                    <><ShieldCheck className="h-5 w-5 text-primary" /> Assign Admin Role</>
                  ) : (
                    <><UserCheck className="h-5 w-5 text-primary" /> Assign Voter Role</>
                  )}
                </>
              ) : (
                <>
                  {confirmDialog.role === 'admin' ? (
                    <><ShieldX className="h-5 w-5 text-destructive" /> Remove Admin Role</>
                  ) : (
                    <><UserX className="h-5 w-5 text-destructive" /> Remove Voter Role</>
                  )}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === 'add' ? (
                <>
                  {confirmDialog.role === 'admin' ? 
                    'This will give the user administrative privileges. They will be able to manage all aspects of the platform.' :
                    'This will allow the user to participate in elections.'
                  }
                </>
              ) : (
                <>
                  {confirmDialog.role === 'admin' ? 
                    'This will remove administrative privileges from the user.' :
                    'This will prevent the user from participating in elections.'
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setConfirmDialog(prev => ({...prev, open: false}))}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === 'remove' ? "destructive" : "default"}
              onClick={() => handleToggleRole(
                confirmDialog.userId, 
                confirmDialog.role as "admin" | "voter", 
                confirmDialog.action === 'remove'
              )}
            >
              {confirmDialog.action === 'add' ? 'Assign Role' : 'Remove Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
