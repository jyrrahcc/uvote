import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, University, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Election, mapDbElectionToElection } from "@/types";
import ElectionCard from "@/features/elections/components/ElectionCard";

/**
 * Elections listing page component
 */
const Elections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const { isAdmin } = useRole();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchElections();
    }
  }, [user]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get user profile data to check eligibility
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }
      
      const userProfile = profileData || { department: '', year_level: '', is_verified: false };
      
      // Then fetch all elections
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const transformedElections = data?.map(mapDbElectionToElection) || [];
      
      // For non-admin users, check if they're eligible for each election
      if (!isAdmin) {
        // Get eligible_voters records for this user
        const { data: eligibleVotersData } = await supabase
          .from('eligible_voters')
          .select('election_id')
          .eq('user_id', user?.id);
        
        const eligibleElectionIds = new Set(eligibleVotersData?.map(ev => ev.election_id) || []);
        
        // Filter elections based on eligibility
        const eligibleElections = transformedElections.filter(election => {
          // Public elections with no restrictions are accessible to all
          if (!election.restrictVoting && !election.isPrivate) {
            return true;
          }
          
          // If user is explicitly added to eligible_voters
          if (eligibleElectionIds.has(election.id)) {
            return true;
          }
          
          // If election restricts by department, check department match
          const departmentMatch = election.departments?.includes(userProfile.department) || 
                                 election.department === userProfile.department;
          
          // If election restricts by year level, check year level match
          const yearLevelMatch = election.eligibleYearLevels?.includes(userProfile.year_level);
          
          if (election.restrictVoting) {
            if (election.departments?.length && election.eligibleYearLevels?.length) {
              return departmentMatch && yearLevelMatch;
            } else if (election.departments?.length) {
              return departmentMatch;
            } else if (election.eligibleYearLevels?.length) {
              return yearLevelMatch;
            }
          }
          
          // Default to showing the election if none of the above apply
          return true;
        });
        
        setElections(eligibleElections);
      } else {
        // Admins can see all elections
        setElections(transformedElections);
      }
      
      // Extract unique departments for filtering
      const uniqueDepartments = Array.from(
        new Set(transformedElections.map(e => e.department).filter(Boolean))
      ) as string[];
      
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setError("Failed to load elections. Please try again.");
      toast.error("Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchElections();
  };

  const isAccessVerified = (election: Election) => {
    if (!election.isPrivate) return true;
    
    try {
      const verifiedElections = JSON.parse(localStorage.getItem('verifiedElections') || '{}');
      return !!verifiedElections[election.accessCode || ''];
    } catch {
      return false;
    }
  };

  const filteredElections = elections.filter((election) => {
    // Apply search term filter
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter if selected
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    
    // Apply department filter if selected
    const matchesDepartment = departmentFilter ? election.department === departmentFilter : true;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Determine if an election is in candidacy period
  const isInCandidacyPeriod = (election: Election) => {
    if (!election.candidacyStartDate || !election.candidacyEndDate) return false;
    
    const now = new Date();
    const candidacyStart = new Date(election.candidacyStartDate);
    const candidacyEnd = new Date(election.candidacyEndDate);
    
    return now >= candidacyStart && now <= candidacyEnd;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center">
          <University className="h-8 w-8 mr-3 text-[#008f50]" />
          <h1 className="text-3xl font-bold">DLSU-D Elections</h1>
        </div>
        {isAdmin && (
          <Button asChild className="mt-4 md:mt-0 bg-[#008f50] hover:bg-[#007a45]">
            <Link to="/admin/elections">
              <Plus className="mr-2 h-4 w-4" />
              Manage Elections
            </Link>
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Search Elections</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title, description or department..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-48 space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48 space-y-2">
            <Label htmlFor="department-filter">College/Department</Label>
            <Select value={departmentFilter || "all"} onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}>
              <SelectTrigger id="department-filter">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-10 h-10 border-4 border-[#008f50] border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-xl mb-2">Loading elections...</div>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the available elections.</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 border rounded-md">
            <p className="text-xl text-destructive font-medium mb-4">{error}</p>
            <Button onClick={handleRetry}>
              Retry
            </Button>
          </div>
        ) : filteredElections.length > 0 ? (
          <>
            {/* Active Candidacy Period Elections */}
            {filteredElections.some(e => isInCandidacyPeriod(e)) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#008f50]" />
                  Open for Candidacy
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredElections
                    .filter(e => isInCandidacyPeriod(e))
                    .map((election) => (
                      <ElectionCard 
                        key={election.id} 
                        election={election}
                        isAccessVerified={isAccessVerified(election)} 
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Active Elections */}
            {filteredElections.some(e => e.status === 'active') && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Active Elections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredElections
                    .filter(e => e.status === 'active')
                    .map((election) => (
                      <ElectionCard 
                        key={election.id} 
                        election={election}
                        isAccessVerified={isAccessVerified(election)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Elections */}
            {filteredElections.some(e => e.status === 'upcoming') && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Upcoming Elections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredElections
                    .filter(e => e.status === 'upcoming')
                    .map((election) => (
                      <ElectionCard 
                        key={election.id} 
                        election={election}
                        isAccessVerified={isAccessVerified(election)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Completed Elections */}
            {filteredElections.some(e => e.status === 'completed') && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Completed Elections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredElections
                    .filter(e => e.status === 'completed')
                    .map((election) => (
                      <ElectionCard 
                        key={election.id} 
                        election={election}
                        isAccessVerified={isAccessVerified(election)}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 border rounded-md">
            <p className="text-xl font-semibold">No elections found</p>
            <p className="text-muted-foreground mt-2">
              {searchTerm || statusFilter || departmentFilter ? 
                "Try adjusting your search or filters" : 
                isAdmin ? 
                  "No elections are available at this time" : 
                  "You are not eligible to participate in any active elections"
              }
            </p>
            {(searchTerm || statusFilter || departmentFilter) && (
              <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setStatusFilter(null); setDepartmentFilter(null); }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;
