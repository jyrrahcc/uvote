
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, UserPlus, Users, Filter, School } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface EligibleVotersManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  restrictVoting: boolean;
  setRestrictVoting: (value: boolean) => void;
}

interface EligibleVoter {
  id: string;
  user_id: string;
  election_id: string;
  added_by: string;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    student_id?: string;
    department?: string;
    year_level?: string;
  };
}

interface DlsudUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  department?: string;
  year_level?: string;
}

const EligibleVotersManager = forwardRef<any, EligibleVotersManagerProps>(
  ({ electionId, isNewElection, restrictVoting, setRestrictVoting }, ref) => {
    const { user } = useAuth();
    const [voters, setVoters] = useState<EligibleVoter[]>([]);
    const [availableUsers, setAvailableUsers] = useState<DlsudUser[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<string | null>(null);
    const [departments, setDepartments] = useState<string[]>([]);
    const [yearLevels, setYearLevels] = useState<string[]>([]);
    const [bulkSelectionMode, setBulkSelectionMode] = useState<'individual' | 'department' | 'year'>('individual');

    // Add ref methods to be called from parent component
    useImperativeHandle(ref, () => ({
      getEligibleVotersForNewElection: () => {
        return Array.from(selectedUserIds);
      }
    }));

    // Fetch eligible voters for existing election
    useEffect(() => {
      if (electionId && restrictVoting && !isNewElection) {
        fetchEligibleVoters();
      } else {
        setVoters([]);
      }
    }, [electionId, restrictVoting, isNewElection]);

    // Fetch available DLSU-D users
    useEffect(() => {
      if ((restrictVoting && isNewElection) || (restrictVoting && electionId)) {
        fetchAvailableUsers();
      }
    }, [restrictVoting, isNewElection, electionId]);

    const fetchEligibleVoters = async () => {
      if (!electionId) return;

      setLoading(true);
      try {
        // First get the eligible voters
        const { data: eligibleVotersData, error: eligibleVotersError } = await supabase
          .from('eligible_voters')
          .select('*')
          .eq('election_id', electionId);

        if (eligibleVotersError) throw eligibleVotersError;

        if (eligibleVotersData && eligibleVotersData.length > 0) {
          // Get the user profiles for all eligible voters
          const userIds = eligibleVotersData.map(voter => voter.user_id);
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
            
          if (profilesError) throw profilesError;

          // Combine the data
          const formattedData = eligibleVotersData.map(voter => {
            const userProfile = profilesData?.find(profile => profile.id === voter.user_id);
            return {
              ...voter,
              profile: userProfile ? {
                first_name: userProfile.first_name,
                last_name: userProfile.last_name,
                email: userProfile.email,
                student_id: userProfile.student_id,
                department: userProfile.department,
                year_level: userProfile.year_level
              } : undefined
            };
          });

          setVoters(formattedData);
        } else {
          setVoters([]);
        }
      } catch (error) {
        console.error("Error fetching eligible voters:", error);
        toast.error("Failed to load eligible voters");
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailableUsers = async () => {
      setLoading(true);
      try {
        // Fetch all DLSU-D users (profiles)
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;

        const users = data as DlsudUser[];
        
        // Extract unique departments and year levels
        const uniqueDepartments = Array.from(
          new Set(users.filter(user => user.department).map(user => user.department))
        ).filter(Boolean) as string[];
        
        const uniqueYearLevels = Array.from(
          new Set(users.filter(user => user.year_level).map(user => user.year_level))
        ).filter(Boolean) as string[];
        
        setDepartments(uniqueDepartments);
        setYearLevels(uniqueYearLevels);
        setAvailableUsers(users);

        // If there are already voters for this election, select them
        if (electionId && !isNewElection) {
          const { data: votersData, error: votersError } = await supabase
            .from('eligible_voters')
            .select('user_id')
            .eq('election_id', electionId);

          if (!votersError && votersData) {
            const selectedIds = new Set<string>();
            votersData.forEach(voter => {
              selectedIds.add(voter.user_id);
            });
            setSelectedUserIds(selectedIds);
          }
        }
      } catch (error) {
        console.error("Error fetching available users:", error);
        toast.error("Failed to load DLSU-D community members");
      } finally {
        setLoading(false);
      }
    };

    const handleToggleUser = (userId: string) => {
      const newSelectedUserIds = new Set(selectedUserIds);
      if (newSelectedUserIds.has(userId)) {
        newSelectedUserIds.delete(userId);
      } else {
        newSelectedUserIds.add(userId);
      }
      setSelectedUserIds(newSelectedUserIds);
    };

    const handleSelectByDepartment = (department: string) => {
      const newSelectedUserIds = new Set(selectedUserIds);
      
      availableUsers.forEach(user => {
        if (user.department === department) {
          newSelectedUserIds.add(user.id);
        }
      });
      
      setSelectedUserIds(newSelectedUserIds);
      toast.success(`Selected all members from ${department}`);
    };

    const handleSelectByYearLevel = (yearLevel: string) => {
      const newSelectedUserIds = new Set(selectedUserIds);
      
      availableUsers.forEach(user => {
        if (user.year_level === yearLevel) {
          newSelectedUserIds.add(user.id);
        }
      });
      
      setSelectedUserIds(newSelectedUserIds);
      toast.success(`Selected all ${yearLevel} students`);
    };

    const handleSelectAll = () => {
      const filteredUsers = filterUsers();
      const newSelectedUserIds = new Set(selectedUserIds);
      
      filteredUsers.forEach(user => {
        newSelectedUserIds.add(user.id);
      });
      
      setSelectedUserIds(newSelectedUserIds);
    };

    const handleUnselectAll = () => {
      const filteredUsers = filterUsers();
      const newSelectedUserIds = new Set(selectedUserIds);
      
      filteredUsers.forEach(user => {
        newSelectedUserIds.delete(user.id);
      });
      
      setSelectedUserIds(newSelectedUserIds);
    };

    const handleAddEligibleVoters = async () => {
      if (!electionId || selectedUserIds.size === 0) {
        return;
      }

      setLoading(true);
      try {
        // Get current eligible voters
        const { data: currentVoters, error: fetchError } = await supabase
          .from('eligible_voters')
          .select('user_id')
          .eq('election_id', electionId);

        if (fetchError) throw fetchError;

        // Find new voters to add
        const existingUserIds = new Set(currentVoters?.map(v => v.user_id) || []);
        const newVoters = Array.from(selectedUserIds)
          .filter(userId => !existingUserIds.has(userId))
          .map(userId => ({
            election_id: electionId,
            user_id: userId,
            added_by: user?.id || '',
          }));

        if (newVoters.length > 0) {
          const { error: insertError } = await supabase
            .from('eligible_voters')
            .insert(newVoters);

          if (insertError) throw insertError;
        }

        // Find voters to remove
        const votersToRemove = Array.from(existingUserIds)
          .filter(userId => !selectedUserIds.has(userId));

        if (votersToRemove.length > 0) {
          const { error: deleteError } = await supabase
            .from('eligible_voters')
            .delete()
            .eq('election_id', electionId)
            .in('user_id', votersToRemove);

          if (deleteError) throw deleteError;
        }

        toast.success("Eligible voters updated successfully");
        fetchEligibleVoters();
      } catch (error) {
        console.error("Error updating eligible voters:", error);
        toast.error("Failed to update eligible voters");
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveVoter = async (voterId: string) => {
      if (!electionId) return;

      try {
        const { error } = await supabase
          .from('eligible_voters')
          .delete()
          .eq('id', voterId);

        if (error) throw error;

        // Update local state
        setVoters(voters.filter(voter => voter.id !== voterId));
        toast.success("Voter removed successfully");
      } catch (error) {
        console.error("Error removing voter:", error);
        toast.error("Failed to remove voter");
      }
    };

    const filterUsers = () => {
      return availableUsers.filter(user => {
        const nameMatch = `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.student_id?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        const departmentMatch = !departmentFilter || user.department === departmentFilter;
        const yearMatch = !yearFilter || user.year_level === yearFilter;
        
        return nameMatch && departmentMatch && yearMatch;
      });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="restrictVoting"
              checked={restrictVoting}
              onCheckedChange={() => setRestrictVoting(!restrictVoting)}
            />
            <label htmlFor="restrictVoting" className="font-medium text-sm">
              Restrict voting to specific DLSU-D community members
            </label>
          </div>
        </div>

        {restrictVoting && (
          <>
            <div className="border rounded-md p-4 bg-muted/50">
              <h3 className="font-medium mb-2 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Restrict who can vote in this election
              </h3>
              <p className="text-sm mb-4">
                Only the selected DLSU-D community members will be able to vote in this election. 
                Add eligible voters from the list of registered users in the system.
              </p>

              {isNewElection ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Select Eligible Voters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xl">
                    <SheetHeader>
                      <SheetTitle>Select Eligible Voters</SheetTitle>
                      <SheetDescription>
                        Choose which DLSU-D community members can vote in this election.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="py-4 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name, email, or ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2">
                        <Select 
                          value={departmentFilter || "all"}
                          onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select 
                          value={yearFilter || "all"}
                          onValueChange={(value) => setYearFilter(value === "all" ? null : value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Year Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Year Levels</SelectItem>
                            {yearLevels.map(year => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {selectedUserIds.size} community members selected
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" onClick={handleSelectAll}>
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleUnselectAll}>
                            Clear
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Bulk Selection:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Select onValueChange={(value) => handleSelectByDepartment(value)}>
                            <SelectTrigger>
                              <School className="h-4 w-4 mr-2" />
                              <span>Select by College</span>
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select onValueChange={(value) => handleSelectByYearLevel(value)}>
                            <SelectTrigger>
                              <Filter className="h-4 w-4 mr-2" />
                              <span>Select by Year</span>
                            </SelectTrigger>
                            <SelectContent>
                              {yearLevels.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[calc(100vh-380px)]">
                        <div className="space-y-1">
                          {filterUsers().map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-accent"
                            >
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedUserIds.has(user.id)}
                                onCheckedChange={() => handleToggleUser(user.id)}
                              />
                              <label
                                htmlFor={`user-${user.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-medium">{`${user.first_name} ${user.last_name}`}</div>
                                <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:space-x-2">
                                  <span>{user.email}</span>
                                  {user.student_id && (
                                    <span className="sm:before:content-['•'] sm:before:mx-1">
                                      ID: {user.student_id}
                                    </span>
                                  )}
                                </div>
                                {(user.department || user.year_level) && (
                                  <div className="text-xs text-muted-foreground">
                                    {user.department && `${user.department}`}
                                    {user.department && user.year_level && " • "}
                                    {user.year_level && `${user.year_level}`}
                                  </div>
                                )}
                              </label>
                            </div>
                          ))}
                          
                          {filterUsers().length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No users found matching your search criteria.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Current Eligible Voters</h3>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Manage Voters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-xl">
                        <SheetHeader>
                          <SheetTitle>Manage Eligible Voters</SheetTitle>
                          <SheetDescription>
                            Update who can vote in this election.
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="py-4 space-y-4">
                          <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1 relative">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by name, email, or ID..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-2">
                            <Select 
                              value={departmentFilter || "all"}
                              onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(dept => (
                                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select 
                              value={yearFilter || "all"}
                              onValueChange={(value) => setYearFilter(value === "all" ? null : value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Year Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Year Levels</SelectItem>
                                {yearLevels.map(year => (
                                  <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              {selectedUserIds.size} community members selected
                            </div>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                Select All
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleUnselectAll}>
                                Clear
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium">Bulk Selection:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Select onValueChange={(value) => handleSelectByDepartment(value)}>
                                <SelectTrigger>
                                  <School className="h-4 w-4 mr-2" />
                                  <span>Select by College</span>
                                </SelectTrigger>
                                <SelectContent>
                                  {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select onValueChange={(value) => handleSelectByYearLevel(value)}>
                                <SelectTrigger>
                                  <Filter className="h-4 w-4 mr-2" />
                                  <span>Select by Year</span>
                                </SelectTrigger>
                                <SelectContent>
                                  {yearLevels.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <ScrollArea className="h-[calc(100vh-380px)]">
                            <div className="space-y-1">
                              {filterUsers().map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-accent"
                                >
                                  <Checkbox
                                    id={`user-${user.id}`}
                                    checked={selectedUserIds.has(user.id)}
                                    onCheckedChange={() => handleToggleUser(user.id)}
                                  />
                                  <label
                                    htmlFor={`user-${user.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="font-medium">{`${user.first_name} ${user.last_name}`}</div>
                                    <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:space-x-2">
                                      <span>{user.email}</span>
                                      {user.student_id && (
                                        <span className="sm:before:content-['•'] sm:before:mx-1">
                                          ID: {user.student_id}
                                        </span>
                                      )}
                                    </div>
                                    {(user.department || user.year_level) && (
                                      <div className="text-xs text-muted-foreground">
                                        {user.department && `${user.department}`}
                                        {user.department && user.year_level && " • "}
                                        {user.year_level && `${user.year_level}`}
                                      </div>
                                    )}
                                  </label>
                                </div>
                              ))}
                              
                              {filterUsers().length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  No users found matching your search criteria.
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                          
                          <div className="pt-4 flex justify-end">
                            <Button
                              onClick={handleAddEligibleVoters}
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full inline-block mr-2"></div>
                      Loading voters...
                    </div>
                  ) : voters.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {voters.map((voter) => (
                            <TableRow key={voter.id}>
                              <TableCell>{voter.profile?.first_name} {voter.profile?.last_name}</TableCell>
                              <TableCell>{voter.profile?.email}</TableCell>
                              <TableCell>{voter.profile?.department || "Not specified"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVoter(voter.id)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-sm text-muted-foreground">No eligible voters have been added yet.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
);

EligibleVotersManager.displayName = "EligibleVotersManager";

export default EligibleVotersManager;
