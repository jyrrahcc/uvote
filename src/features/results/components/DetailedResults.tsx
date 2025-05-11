
import { ElectionResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/features/auth/context/RoleContext";
import { useState } from "react";

interface DetailedResultsProps {
  result: ElectionResult;
}

const DetailedResults = ({ result }: DetailedResultsProps) => {
  const { isAdmin } = useRole();
  const [exporting, setExporting] = useState(false);
  
  // Group candidates by position
  const candidatesByPosition = result.candidates.reduce((acc: Record<string, typeof result.candidates>, candidate) => {
    if (!candidate.position) return acc;
    
    if (!acc[candidate.position]) {
      acc[candidate.position] = [];
    }
    acc[candidate.position].push(candidate);
    return acc;
  }, {});
  
  const positions = Object.keys(candidatesByPosition);
  
  // Handle export to CSV
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Prepare CSV content
      let csvContent = "Position,Candidate Name,Votes,Percentage\n";
      
      positions.forEach(position => {
        const candidates = candidatesByPosition[position];
        candidates
          .sort((a, b) => b.votes - a.votes)
          .forEach(candidate => {
            csvContent += `"${position}","${candidate.name}",${candidate.votes},${candidate.percentage}%\n`;
          });
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `election-results-${result.electionId}.csv`;
      link.click();
      
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Detailed Results</CardTitle>
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={exporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {positions.length > 0 ? (
          <div className="space-y-6">
            {positions.map((position) => (
              <div key={position} className="space-y-3">
                <h3 className="font-medium text-lg">{position}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesByPosition[position]
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{candidate.name}</TableCell>
                          <TableCell className="text-right">{candidate.votes}</TableCell>
                          <TableCell className="text-right">{candidate.percentage}%</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No votes have been cast yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedResults;
