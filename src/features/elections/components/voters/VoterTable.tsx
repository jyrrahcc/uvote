
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";

export interface VoterEntry {
  id: string;
  email: string;
  name: string;
  department?: string;
  year_level?: string;
  student_id?: string;
  isSelected?: boolean;
}

interface VoterTableProps {
  loading: boolean;
  filteredVoters: VoterEntry[];
  selectedVoters: string[];
  handleToggleAllVoters: (checked: boolean) => void;
  handleSelectVoter: (voterId: string, isSelected: boolean) => void;
}

const VoterTable = ({
  loading,
  filteredVoters,
  selectedVoters,
  handleToggleAllVoters,
  handleSelectVoter
}: VoterTableProps) => {
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={
                  filteredVoters.length > 0 && 
                  filteredVoters.every(voter => selectedVoters.includes(voter.id))
                } 
                onCheckedChange={handleToggleAllVoters}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVoters.length > 0 ? (
            filteredVoters.map(voter => (
              <TableRow key={voter.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedVoters.includes(voter.id)}
                    onCheckedChange={(checked) => handleSelectVoter(voter.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">{voter.name}</TableCell>
                <TableCell>{voter.email}</TableCell>
                <TableCell>{voter.department || "—"}</TableCell>
                <TableCell>{voter.year_level || "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <p className="text-muted-foreground">No matching users found</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default VoterTable;
