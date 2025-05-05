
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import ElectionCard from "./ElectionCard";
import { Election } from "@/types";

// Sample data for elections
const sampleElections: Election[] = [
  {
    id: "1",
    title: "Student Body President",
    description: "Vote for your student body president for the 2025-2026 academic year.",
    startDate: "2025-09-01T00:00:00Z",
    endDate: "2025-09-07T23:59:59Z",
    status: "upcoming",
    createdBy: "admin-1",
    createdAt: "2025-08-01T00:00:00Z",
    updatedAt: "2025-08-01T00:00:00Z",
    isPrivate: false
  },
  {
    id: "2",
    title: "Community Board Election",
    description: "Select the members who will represent your community interests for the next term.",
    startDate: "2025-05-01T00:00:00Z",
    endDate: "2025-05-15T23:59:59Z",
    status: "active",
    createdBy: "admin-2",
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
    isPrivate: false
  },
  {
    id: "3",
    title: "Club Leadership Vote",
    description: "Choose the next president and vice president of the Environmental Club.",
    startDate: "2025-02-15T00:00:00Z",
    endDate: "2025-03-01T23:59:59Z",
    status: "completed",
    createdBy: "admin-3",
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    isPrivate: true,
    accessCode: "ECO2025"
  }
];

/**
 * Component to list and filter elections
 */
const ElectionsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredElections = sampleElections.filter((election) => {
    // Apply search term filter
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         election.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter if selected
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
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

      {filteredElections.length > 0 ? (
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
  );
};

export default ElectionsList;
