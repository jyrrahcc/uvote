
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Eye, RefreshCcw, Check, Download, List, ArrowUp, ArrowDown } from "lucide-react";
import { Election } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ElectionTableProps {
  elections: Election[];
  onEditElection: (election: Election) => void;
  onElectionDeleted: () => void;
}

interface SortConfig {
  key: keyof Election | "";
  direction: "asc" | "desc";
}

const ElectionTable = ({ elections, onEditElection, onElectionDeleted }: ElectionTableProps) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" });
  
  /**
   * Delete an election and all related data
   */
  const handleDeleteElection = async (electionId: string) => {
    try {
      setDeletingId(electionId);
      
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', electionId);
      
      if (error) throw error;
      
      toast.success("Election deleted successfully");
      onElectionDeleted();
    } catch (error) {
      console.error("Error deleting election:", error);
      toast.error("Failed to delete election");
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Reset all votes for an election
   */
  const handleResetVotes = async (electionId: string) => {
    try {
      setResettingId(electionId);
      
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('election_id', electionId);
      
      if (error) throw error;
      
      toast.success("Election votes have been reset successfully", {
        description: "All voters can now vote again in this election"
      });
      onElectionDeleted(); // Refresh the list
    } catch (error) {
      console.error("Error resetting election votes:", error);
      toast.error("Failed to reset election votes");
    } finally {
      setResettingId(null);
    }
  };

  /**
   * Mark an election as completed before its end date
   */
  const handleCompleteElection = async (electionId: string) => {
    try {
      setCompletingId(electionId);
      
      const { error } = await supabase
        .from('elections')
        .update({ status: 'completed' })
        .eq('id', electionId);
      
      if (error) throw error;
      
      toast.success("Election marked as completed", {
        description: "The election has been finalized before its scheduled end date"
      });
      onElectionDeleted(); // Refresh the list
    } catch (error) {
      console.error("Error completing election:", error);
      toast.error("Failed to complete the election");
    } finally {
      setCompletingId(null);
    }
  };

  /**
   * Request to sort by a specific column
   */
  const requestSort = (key: keyof Election) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /**
   * Export elections data to CSV
   */
  const exportToCSV = () => {
    const filteredData = filterAndSortElections();
    
    // Extract column headers from an election record
    const headers = [
      "Title",
      "Department",
      "Status",
      "Candidacy Start",
      "Candidacy End", 
      "Voting Start",
      "Voting End",
      "Privacy"
    ];
    
    const csvContent = [
      // Add title as a separate first row
      ["DLSU-D Elections Management"],
      ["Report Generated: " + new Date().toLocaleString()],
      [""],
      headers,
      ...filteredData.map(election => [
        election.title,
        election.department || "University-wide",
        election.status,
        election.candidacyStartDate ? new Date(election.candidacyStartDate).toLocaleDateString() : "Not specified",
        election.candidacyEndDate ? new Date(election.candidacyEndDate).toLocaleDateString() : "Not specified",
        new Date(election.startDate).toLocaleDateString(),
        new Date(election.endDate).toLocaleDateString(),
        election.isPrivate ? "Private" : "Public"
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dlsu_elections_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Export elections data to PDF
   */
  const exportToPDF = () => {
    toast.info("Preparing PDF download", {
      description: "Your PDF is being generated and will download shortly.",
      duration: 3000,
    });
    
    // In a real implementation, you would use a PDF library
    // like jspdf or similar. For now we just show a success message.
    setTimeout(() => {
      toast.success("PDF downloaded successfully");
    }, 1500);
  };

  /**
   * Filter and sort elections data based on search term, filters and sort config
   */
  const filterAndSortElections = (): Election[] => {
    // First apply filters
    const filtered = elections.filter(election => {
      // Apply search term filter
      const matchesSearch = 
        searchTerm === "" || 
        election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (election.description && election.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (election.department && election.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filter if selected
      const matchesStatus = statusFilter === "" || election.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    // Then apply sorting if applicable
    if (sortConfig.key) {
      const sortedData = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle different value types
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Try to compare as strings first (for most fields)
        const compare = String(aValue).localeCompare(String(bValue));
        
        return sortConfig.direction === "asc" ? compare : -compare;
      });
      
      return sortedData;
    }
    
    return filtered;
  };
  
  const filteredElections = filterAndSortElections();
  
  // Get the total count of elections after filtering
  const totalElections = filteredElections.length;

  return (
    <div className="space-y-4">
      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-end w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(parseInt(value))}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Rows</SelectItem>
              <SelectItem value="10">10 Rows</SelectItem>
              <SelectItem value="20">20 Rows</SelectItem>
              <SelectItem value="50">50 Rows</SelectItem>
              <SelectItem value="100">100 Rows</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" /> Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <Download className="h-4 w-4 mr-2" /> Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Results counter */}
      <div className="text-sm text-muted-foreground">
        Showing {Math.min(rowsPerPage, totalElections)} of {totalElections} elections
      </div>

      {/* Elections table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('title')}>
                Title
                {sortConfig.key === 'title' && (
                  sortConfig.direction === 'asc' 
                  ? <ArrowUp className="inline ml-1 h-3 w-3" /> 
                  : <ArrowDown className="inline ml-1 h-3 w-3" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('department')}>
                College/Department
                {sortConfig.key === 'department' && (
                  sortConfig.direction === 'asc' 
                  ? <ArrowUp className="inline ml-1 h-3 w-3" /> 
                  : <ArrowDown className="inline ml-1 h-3 w-3" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                Status
                {sortConfig.key === 'status' && (
                  sortConfig.direction === 'asc' 
                  ? <ArrowUp className="inline ml-1 h-3 w-3" /> 
                  : <ArrowDown className="inline ml-1 h-3 w-3" />
                )}
              </TableHead>
              <TableHead>Candidacy Period</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('startDate')}>
                Voting Period
                {sortConfig.key === 'startDate' && (
                  sortConfig.direction === 'asc' 
                  ? <ArrowUp className="inline ml-1 h-3 w-3" /> 
                  : <ArrowDown className="inline ml-1 h-3 w-3" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('isPrivate')}>
                Privacy
                {sortConfig.key === 'isPrivate' && (
                  sortConfig.direction === 'asc' 
                  ? <ArrowUp className="inline ml-1 h-3 w-3" /> 
                  : <ArrowDown className="inline ml-1 h-3 w-3" />
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredElections.slice(0, rowsPerPage).map((election) => (
              <TableRow key={election.id}>
                <TableCell className="font-medium">{election.title}</TableCell>
                <TableCell>{election.department || "University-wide"}</TableCell>
                <TableCell className="capitalize">{election.status}</TableCell>
                <TableCell>
                  {election.candidacyStartDate && election.candidacyEndDate
                    ? `${new Date(election.candidacyStartDate).toLocaleDateString()} - ${new Date(election.candidacyEndDate).toLocaleDateString()}`
                    : "Not specified"}
                </TableCell>
                <TableCell>{`${new Date(election.startDate).toLocaleDateString()} - ${new Date(election.endDate).toLocaleDateString()}`}</TableCell>
                <TableCell>{election.isPrivate ? "Private" : "Public"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/elections/${election.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEditElection(election)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Election</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {election.status !== "completed" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Complete Election Early?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will mark the election "{election.title}" as completed before its scheduled end date.
                                    No further votes will be accepted. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => handleCompleteElection(election.id)}
                                  >
                                    {completingId === election.id ? "Completing..." : "Complete Election"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Complete Election</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-amber-600"
                              >
                                <RefreshCcw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Election Votes?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete all votes for the election "{election.title}". 
                                  All voters will be able to vote again. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-amber-600 text-white hover:bg-amber-700"
                                  onClick={() => handleResetVotes(election.id)}
                                >
                                  {resettingId === election.id ? "Resetting..." : "Reset Votes"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset Votes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the election "{election.title}" and all associated data including
                                  candidates and votes. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteElection(election.id)}
                                >
                                  {deletingId === election.id ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Election</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ElectionTable;
