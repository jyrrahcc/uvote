
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import ElectionCard from "@/features/elections/components/ElectionCard";
import { supabase } from "@/integrations/supabase/client";
import { Election, mapDbElectionToElection } from "@/types";
import { DLSU_DEPARTMENTS } from "@/types/constants";
import { checkUserEligibility } from "@/utils/eligibilityUtils";
import { Calendar, Search, University } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
      
      // Then fetch all elections
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const transformedElections = data?.map(mapDbElectionToElection) || [];
      
      // For non-admin users, check if they're eligible for each election using eligibilityUtils
      if (!isAdmin) {
        const eligibleElections = [];
        
        // Check eligibility for each election
        for (const election of transformedElections) {
          // Public elections with no restrictions are accessible to all
          if (!election.isPrivate) {
            eligibleElections.push(election);
            continue;
          }
          
          // Use eligibilityUtils to check user eligibility
          const { isEligible } = await checkUserEligibility(user?.id, election);
          
          if (isEligible) {
            eligibleElections.push(election);
          }
        }
        
        setElections(eligibleElections);
      } else {
        // Admins can see all elections
        setElections(transformedElections);
      }
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
                         election.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter if selected
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    
    // Apply department filter if selected
    const matchesDepartment = departmentFilter 
      ? election.colleges?.includes(departmentFilter)
      : true;
    
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
                placeholder="Search by title, description or college..."
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
            <Label htmlFor="department-filter">College</Label>
            <Select value={departmentFilter || "all"} onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}>
              <SelectTrigger id="department-filter">
                <SelectValue placeholder="All Colleges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {DLSU_DEPARTMENTS.map((dept) => (
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
