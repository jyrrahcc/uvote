
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
  UserCog,
  User,
  Check,
  X,
  Info
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
import { DlsudProfile } from "@/types";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  department?: string;
  year_level?: string;
  is_verified?: boolean;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const { assignRole, removeRole } = useRole();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Get all user profiles with more detailed information
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, student_id, department, year_level, is_verified');
      
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
    if (isProcessing) return; // Prevent multiple clicks
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      // Add a small delay before enabling interactions again
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };
  
  const handleVerifyProfile = async (userId: string, isVerified: boolean) => {
    if (isProcessing) return;
    
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
          
          return updatedUser;
        }
        return user;
      }));
      
      // Update selected user if dialog is open
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          is_verified: !isVerified
        });
      }
      
      toast.success(
        isVerified 
          ? "Profile verification revoked successfully" 
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
                    <TableHead>Verification</TableHead>
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
                        <TableCell>
                          {user.is_verified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <Info className="h-3 w-3 mr-1" />
                              Not Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.id !== currentUser?.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openProfileDialog(user)}
                                title="View Profile"
                              >
                                <User className="h-4 w-4" />
                                <span className="sr-only">View Profile</span>
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    disabled={isProcessing}
                                  >
                                    <UserCog className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {user.is_verified ? (
                                    <DropdownMenuItem
                                      onClick={() => handleVerifyProfile(user.id, true)}
                                      disabled={isProcessing}
                                    >
                                      <X className="mr-2 h-4 w-4 text-amber-600" />
                                      Revoke Verification
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleVerifyProfile(user.id, false)}
                                      disabled={isProcessing}
                                    >
                                      <Check className="mr-2 h-4 w-4 text-green-600" />
                                      Verify Profile
                                    </DropdownMenuItem>
                                  )}
                                  
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
                                      disabled={isProcessing}
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
                                      disabled={isProcessing}
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
                                      disabled={isProcessing}
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
                                      disabled={isProcessing}
                                    >
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Make Voter
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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

      {/* Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> User Profile
            </DialogTitle>
            <DialogDescription>
              View detailed user profile information
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getUserInitials(selectedUser.first_name, selectedUser.last_name, selectedUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm font-medium">Student ID:</span>
                  <span className="col-span-2">{selectedUser.student_id || "Not provided"}</span>
                </div>
                
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm font-medium">Department:</span>
                  <span className="col-span-2">{selectedUser.department || "Not provided"}</span>
                </div>
                
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm font-medium">Year Level:</span>
                  <span className="col-span-2">{selectedUser.year_level || "Not provided"}</span>
                </div>
                
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm font-medium">Joined:</span>
                  <span className="col-span-2">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm font-medium">Roles:</span>
                  <div className="col-span-2 flex flex-wrap gap-1.5">
                    {selectedUser.roles.length > 0 ? (
                      selectedUser.roles.map(role => (
                        <Badge key={role} variant={role === 'admin' ? 'secondary' : 'outline'} className={role === 'admin' ? 'bg-primary/10 text-primary' : ''}>
                          {role === 'admin' ? <Shield className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No roles assigned</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 items-center">
                  <span className="text-sm font-medium">Verification:</span>
                  <div className="col-span-2">
                    {selectedUser.is_verified ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Info className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Profile Management:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.is_verified ? (
                    <Button 
                      variant="outline" 
                      onClick={() => handleVerifyProfile(selectedUser.id, true)}
                      disabled={isProcessing}
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Revoke Verification
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => handleVerifyProfile(selectedUser.id, false)}
                      disabled={isProcessing}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Verify Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
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
              disabled={isProcessing}
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
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                confirmDialog.action === 'add' ? 'Assign Role' : 'Remove Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
