
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
import { Search, Plus } from "lucide-react";
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
  console.log("Elections page rendering"); // Debug render
  
  const [elections, setElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useRole();
  const { user } = useAuth();
  
  console.log("Elections page - isAdmin:", isAdmin, "user:", user?.id); // Debug user and role
  
  useEffect(() => {
    if (user) {
      fetchElections();
    } else {
      console.log("No user, elections will not be fetched");
    }
  }, [user]);

  const fetchElections = async () => {
    try {
      setLoading(true);
      console.log("Fetching public elections...");
      
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching elections:", error);
        throw error;
      }
      
      console.log("Elections data from public page:", data);
      
      // Transform data to match our Election interface
      const transformedElections = data?.map(mapDbElectionToElection) || [];
      console.log("Transformed elections:", transformedElections.length, "items");
      setElections(transformedElections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const filteredElections = elections.filter((election) => {
    // Apply search term filter
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter if selected
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  console.log("Filtered elections:", filteredElections.length, "items"); // Debug filtered results

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Elections</h1>
        {isAdmin && (
          <Button asChild className="mt-4 md:mt-0">
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
                placeholder="Search by title or description..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl mb-2">Loading elections...</div>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the available elections.</p>
          </div>
        ) : filteredElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl font-semibold">No elections found</p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;
