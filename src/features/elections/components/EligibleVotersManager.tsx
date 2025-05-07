
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/context/AuthContext";

// Import our new components
import VoterSearch from "./voters/VoterSearch";
import VoterBulkActions from "./voters/VoterBulkActions";
import VoterTable, { VoterEntry } from "./voters/VoterTable";
import EmptyVotersState from "./voters/EmptyVotersState";
import { DLSU_DEPARTMENTS, YEAR_LEVELS } from "./voters/VoterSearch";

interface EligibleVotersManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  restrictVoting: boolean;
  setRestrictVoting: (value: boolean) => void;
}

const EligibleVotersManager = forwardRef<any, EligibleVotersManagerProps>(({
  electionId,
  isNewElection,
  restrictVoting,
  setRestrictVoting
}, ref) => {
  const [voters, setVoters] = useState<VoterEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getEligibleVotersForNewElection: () => selectedVoters
  }));
  
  // Fetch existing eligible voters if editing an election
  useEffect(() => {
    if (electionId && !isNewElection && restrictVoting) {
      fetchEligibleVoters();
    }
  }, [electionId, isNewElection, restrictVoting]);
  
  // Fetch users to select from
  useEffect(() => {
    if (restrictVoting) {
      fetchUsers();
    }
  }, [restrictVoting]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, department, year_level, student_id');
      
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned from profiles query");
      }
      
      // Transform data to voter entries
      const transformedData = data.map(user => ({
        id: user.id,
        email: user.email || "",
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed User",
        department: user.department,
        year_level: user.year_level,
        student_id: user.student_id,
        isSelected: selectedVoters.includes(user.id)
      }));
      
      setVoters(transformedData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEligibleVoters = async () => {
    try {
      if (!electionId) return;
      
      setLoading(true);
      
      // Get IDs of eligible voters
      const { data, error } = await supabase
        .from('eligible_voters')
        .select('user_id')
        .eq('election_id', electionId);
      
      if (error) {
        console.error("Error fetching eligible voters:", error);
        throw error;
      }
      
      // Set selected voters
      if (data) {
        const eligibleVoterIds = data.map(v => v.user_id);
        setSelectedVoters(eligibleVoterIds);
      }
      
    } catch (error) {
      console.error("Error fetching eligible voters:", error);
      toast.error("Failed to load eligible voters");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectVoter = (voterId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedVoters(prev => [...prev, voterId]);
    } else {
      setSelectedVoters(prev => prev.filter(id => id !== voterId));
    }
    
    // Update the isSelected property in the voters array for visual feedback
    setVoters(prev => 
      prev.map(voter => 
        voter.id === voterId 
          ? { ...voter, isSelected }
          : voter
      )
    );
  };
  
  const handleSaveEligibleVoters = async () => {
    if (!electionId || isNewElection || !user?.id) return;
    
    try {
      setSaving(true);
      
      // Delete existing eligible voters
      const { error: deleteError } = await supabase
        .from('eligible_voters')
        .delete()
        .eq('election_id', electionId);
      
      if (deleteError) {
        console.error("Error deleting eligible voters:", deleteError);
        throw deleteError;
      }
      
      if (selectedVoters.length === 0) {
        toast.success("Eligible voters cleared successfully");
        setSaving(false);
        return;
      }
      
      // Create an array of eligible voter objects
      const eligibleVoters = selectedVoters.map(voterId => ({
        election_id: electionId,
        user_id: voterId,
        added_by: user.id
      }));
      
      // Insert in batches to avoid request size limits
      const batchSize = 100;
      for (let i = 0; i < eligibleVoters.length; i += batchSize) {
        const batch = eligibleVoters.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('eligible_voters')
          .insert(batch);
        
        if (insertError) {
          console.error("Error inserting eligible voters batch:", insertError);
          throw insertError;
        }
      }
      
      toast.success("Eligible voters saved successfully");
    } catch (error) {
      console.error("Error saving eligible voters:", error);
      toast.error("Failed to save eligible voters");
    } finally {
      setSaving(false);
    }
  };
  
  // Filter voters based on filters and search term
  const filteredVoters = voters.filter(voter => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      voter.name.toLowerCase().includes(searchTermLower) ||
      voter.email.toLowerCase().includes(searchTermLower) ||
      (voter.student_id && voter.student_id.toLowerCase().includes(searchTermLower))
    );
    
    const matchesDepartment = !departmentFilter || voter.department === departmentFilter;
    const matchesYear = !yearFilter || voter.year_level === yearFilter;
    
    return matchesSearch && matchesDepartment && matchesYear;
  });

  const handleToggleAllVoters = (checked: boolean) => {
    if (checked) {
      // Get IDs of all filtered voters
      const filteredIds = filteredVoters.map(voter => voter.id);
      // Combine with existing selections that aren't in the current filter
      const otherSelectedIds = selectedVoters.filter(id => !filteredVoters.some(v => v.id === id));
      setSelectedVoters([...otherSelectedIds, ...filteredIds]);
      
      // Update the isSelected property for visual feedback
      setVoters(prev => 
        prev.map(voter => 
          filteredVoters.some(v => v.id === voter.id)
            ? { ...voter, isSelected: true }
            : voter
        )
      );
    } else {
      // Remove all filtered voters from selection
      const filteredIds = filteredVoters.map(voter => voter.id);
      setSelectedVoters(selectedVoters.filter(id => !filteredIds.includes(id)));
      
      // Update the isSelected property for visual feedback
      setVoters(prev => 
        prev.map(voter => 
          filteredVoters.some(v => v.id === voter.id)
            ? { ...voter, isSelected: false }
            : voter
        )
      );
    }
  };
  
  // Select all users in a department
  const handleSelectByDepartment = (department: string) => {
    if (!department) return;
    
    const departmentUserIds = voters
      .filter(voter => voter.department === department)
      .map(voter => voter.id);
    
    // Add the IDs to selected voters if not already there
    const newSelection = [...selectedVoters];
    let addedCount = 0;
    
    departmentUserIds.forEach(id => {
      if (!newSelection.includes(id)) {
        newSelection.push(id);
        addedCount++;
      }
    });
    
    setSelectedVoters(newSelection);
    
    // Update the isSelected property for visual feedback
    setVoters(prev => 
      prev.map(voter => 
        voter.department === department
          ? { ...voter, isSelected: true }
          : voter
      )
    );
    
    toast.success(`Added ${addedCount} users from ${department}`);
  };
  
  // Select all users in a year level
  const handleSelectByYear = (year: string) => {
    if (!year) return;
    
    const yearUserIds = voters
      .filter(voter => voter.year_level === year)
      .map(voter => voter.id);
    
    // Add the IDs to selected voters if not already there
    const newSelection = [...selectedVoters];
    let addedCount = 0;
    
    yearUserIds.forEach(id => {
      if (!newSelection.includes(id)) {
        newSelection.push(id);
        addedCount++;
      }
    });
    
    setSelectedVoters(newSelection);
    
    // Update the isSelected property for visual feedback
    setVoters(prev => 
      prev.map(voter => 
        voter.year_level === year
          ? { ...voter, isSelected: true }
          : voter
      )
    );
    
    toast.success(`Added ${addedCount} users from ${year}`);
  };

  const handleClearSelection = () => {
    setSelectedVoters([]);
    // Update all voters to not be selected
    setVoters(prev => prev.map(voter => ({ ...voter, isSelected: false })));
    toast.success("Selection cleared");
  };
  
  // If voting is not restricted, don't show any eligible voters UI
  if (!restrictVoting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eligible Voters</CardTitle>
          <CardDescription>
            Voting is currently open to all users. Enable "Restrict Voting" to limit who can vote in this election.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyVotersState setRestrictVoting={setRestrictVoting} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligible Voters</CardTitle>
        <CardDescription>
          Select which users are allowed to vote in this election. Only selected users will be able to cast a vote.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <VoterSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
          />
          
          <VoterBulkActions
            departmentFilter={departmentFilter}
            yearFilter={yearFilter}
            handleSelectByDepartment={handleSelectByDepartment}
            handleSelectByYear={handleSelectByYear}
            clearSelection={handleClearSelection}
          />
          
          <div className="border rounded-md">
            <VoterTable
              loading={loading}
              filteredVoters={filteredVoters}
              selectedVoters={selectedVoters}
              handleToggleAllVoters={handleToggleAllVoters}
              handleSelectVoter={handleSelectVoter}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedVoters.length} {selectedVoters.length === 1 ? 'user' : 'users'} selected
            </p>
            
            {!isNewElection && (
              <Button 
                onClick={handleSaveEligibleVoters}
                disabled={saving}
                className="bg-[#008f50] hover:bg-[#007a45]"
              >
                {saving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Save Eligible Voters
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EligibleVotersManager.displayName = "EligibleVotersManager";

export default EligibleVotersManager;
