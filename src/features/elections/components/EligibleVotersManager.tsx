
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { DlsudVoter, DlsudProfile, mapDbProfileToProfile } from "@/types";

export interface EligibleVotersManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  restrictVoting: boolean;
  setRestrictVoting: (value: boolean) => void;
}

const DLSU_DEPARTMENTS = [
  "College of Business Administration and Accountancy",
  "College of Education",
  "College of Engineering, Architecture and Technology",
  "College of Humanities, Arts and Social Sciences",
  "College of Science and Computer Studies",
  "College of Criminal Justice Education",
  "College of Tourism and Hospitality Management"
];

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

const EligibleVotersManager = forwardRef(({ 
  electionId, 
  isNewElection, 
  restrictVoting, 
  setRestrictVoting 
}: EligibleVotersManagerProps, ref) => {
  const { user } = useAuth();
  const [voters, setVoters] = useState<DlsudVoter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState<string | undefined>(undefined);
  const [yearLevel, setYearLevel] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (electionId && !isNewElection && restrictVoting) {
      fetchEligibleVoters();
    }
  }, [electionId, isNewElection, restrictVoting]);

  // Fetch eligible voters for this election
  const fetchEligibleVoters = async () => {
    if (!electionId) return;

    try {
      setLoading(true);
      
      // First get the eligible voters IDs
      const { data: eligibleData, error: eligibleError } = await supabase
        .from('eligible_voters')
        .select('user_id')
        .eq('election_id', electionId);
      
      if (eligibleError) throw eligibleError;
      
      if (eligibleData.length === 0) {
        setVoters([]);
        return;
      }
      
      // Then fetch the profile data for these users
      const userIds = eligibleData.map(item => item.user_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Map profiles to our voter interface
      const loadedVoters: DlsudVoter[] = profilesData.map(profile => {
        // Use our mapping function to handle optional fields properly
        const mappedProfile = mapDbProfileToProfile(profile);
        
        return {
          id: mappedProfile.id,
          userId: mappedProfile.id,
          studentId: mappedProfile.student_id || "",
          firstName: mappedProfile.first_name,
          lastName: mappedProfile.last_name,
          email: mappedProfile.email,
          department: mappedProfile.department || "",
          yearLevel: mappedProfile.year_level || ""
        };
      });
      
      setVoters(loadedVoters);
    } catch (error) {
      console.error("Error fetching eligible voters:", error);
      toast.error("Failed to load eligible voters");
    } finally {
      setLoading(false);
    }
  };

  // Add a new blank voter entry
  const addVoter = () => {
    setVoters(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        userId: "",
        studentId: "",
        firstName: "",
        lastName: "",
        email: "",
        department: department || "",
        yearLevel: yearLevel || ""
      }
    ]);
  };

  // Remove a voter from the list
  const removeVoter = (index: number) => {
    setVoters(prev => prev.filter((_, i) => i !== index));
  };

  // Update a voter field
  const updateVoter = (index: number, field: keyof DlsudVoter, value: string) => {
    setVoters(prev => 
      prev.map((v, i) => 
        i === index 
          ? { ...v, [field]: value } 
          : v
      )
    );
  };

  // Search for voters by email
  const searchVoters = async () => {
    if (!searchTerm) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      
      if (data.length === 0) {
        toast.warning("No users found with that search term");
        return;
      }
      
      // Add each found user to our voters list if they're not already there
      const newVoters = data
        .filter(profile => !voters.some(v => v.userId === profile.id))
        .map(profile => {
          // Use our mapping function to handle optional fields properly
          const mappedProfile = mapDbProfileToProfile(profile);
          
          return {
            id: mappedProfile.id,
            userId: mappedProfile.id,
            studentId: mappedProfile.student_id || "",
            firstName: mappedProfile.first_name,
            lastName: mappedProfile.last_name,
            email: mappedProfile.email,
            department: mappedProfile.department || "",
            yearLevel: mappedProfile.year_level || ""
          };
        });
      
      if (newVoters.length === 0) {
        toast.info("All found users are already in your eligible voters list");
        return;
      }
      
      setVoters(prev => [...prev, ...newVoters]);
      toast.success(`Added ${newVoters.length} voter(s) to the list`);
      
    } catch (error) {
      console.error("Error searching for voters:", error);
      toast.error("Failed to search for voters");
    } finally {
      setLoading(false);
    }
  };

  // Filter by department
  const filterByDepartment = (departmentValue: string) => {
    setDepartment(departmentValue);
  };

  // Filter by year level
  const filterByYearLevel = (yearLevelValue: string) => {
    setYearLevel(yearLevelValue);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getEligibleVotersForNewElection: () => {
      return voters.map(v => v.userId).filter(id => id !== "");
    }
  }));

  if (!restrictVoting) {
    return (
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="restrict-voting"
            checked={restrictVoting}
            onCheckedChange={(checked) => {
              if (typeof checked === 'boolean') setRestrictVoting(checked);
            }}
          />
          <div>
            <Label htmlFor="restrict-voting" className="font-medium">Enable Voter Restriction</Label>
            <p className="text-sm text-muted-foreground">
              When enabled, only specific voters you add to this list will be able to vote in this election.
              <br />
              Currently, this election is open to all verified DLSU-D students.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <Checkbox 
          id="restrict-voting"
          checked={restrictVoting}
          onCheckedChange={(checked) => {
            if (typeof checked === 'boolean') setRestrictVoting(checked);
          }}
        />
        <div>
          <Label htmlFor="restrict-voting" className="font-medium">Enable Voter Restriction</Label>
          <p className="text-sm text-muted-foreground">
            Only voters you add to this list will be allowed to participate in this election.
          </p>
        </div>
      </div>
      
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium">Search for DLSU-D Students</h3>
            
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-term">Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-term"
                    placeholder="Search by ID, name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="md:w-52 space-y-2">
                <Label htmlFor="department-filter">College/Department</Label>
                <Select value={department} onValueChange={filterByDepartment}>
                  <SelectTrigger id="department-filter">
                    <SelectValue placeholder="Any Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Department</SelectItem>
                    {DLSU_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:w-48 space-y-2">
                <Label htmlFor="year-filter">Year Level</Label>
                <Select value={yearLevel} onValueChange={filterByYearLevel}>
                  <SelectTrigger id="year-filter">
                    <SelectValue placeholder="Any Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Year</SelectItem>
                    {YEAR_LEVELS.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="button" 
                onClick={searchVoters}
                disabled={loading}
              >
                Search
              </Button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Eligible Voters ({voters.length})</h3>
                <Button type="button" variant="outline" size="sm" onClick={addVoter}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Manually
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center p-8">
                  <p>Loading...</p>
                </div>
              ) : voters.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md mt-4">
                  <p className="text-muted-foreground">No eligible voters added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Search for students above or add voters manually
                  </p>
                </div>
              ) : (
                <div className="border rounded-md mt-4 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="py-2 px-4 text-left font-medium text-xs">Student ID</th>
                        <th className="py-2 px-4 text-left font-medium text-xs">Name</th>
                        <th className="py-2 px-4 text-left font-medium text-xs">Email</th>
                        <th className="py-2 px-4 text-left font-medium text-xs">Department</th>
                        <th className="py-2 px-4 text-left font-medium text-xs">Year</th>
                        <th className="py-2 px-4 text-left font-medium text-xs"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters.map((voter, index) => (
                        <tr key={voter.id} className="border-t">
                          <td className="py-3 px-4 text-sm">
                            {voter.studentId || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {voter.firstName} {voter.lastName}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {voter.email || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {voter.department || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {voter.yearLevel || "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeVoter(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

EligibleVotersManager.displayName = "EligibleVotersManager";

export default EligibleVotersManager;
