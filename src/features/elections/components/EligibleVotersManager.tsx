
import { forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import our refactored components
import VoterSearch from "./voters/VoterSearch";
import VoterBulkActions from "./voters/VoterBulkActions";
import VoterTable from "./voters/VoterTable";
import EmptyVotersState from "./voters/EmptyVotersState";
import { useEligibleVoters } from "../hooks/useEligibleVoters";

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
  const {
    loading,
    saving,
    selectedVoters,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    yearFilter,
    setYearFilter,
    filteredVoters,
    handleSelectVoter,
    handleToggleAllVoters,
    handleSelectByDepartment,
    handleSelectByYear,
    handleClearSelection,
    handleSaveEligibleVoters
  } = useEligibleVoters(electionId, isNewElection, restrictVoting);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getEligibleVotersForNewElection: () => selectedVoters
  }));
  
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
