
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Candidate, mapDbCandidateToCandidate } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export interface CandidateManagerProps {
  electionId: string | null;
  isNewElection: boolean;
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

const POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Public Relations Officer",
  "Senator",
  "Governor",
  "Department Representative"
];

const CandidateManager = forwardRef(({ electionId, isNewElection }: CandidateManagerProps, ref) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch candidates if editing an existing election
  useEffect(() => {
    if (electionId && !isNewElection) {
      fetchCandidates();
    }
  }, [electionId, isNewElection]);

  const fetchCandidates = async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      
      if (error) throw error;

      const mappedCandidates = data.map(mapDbCandidateToCandidate);
      setCandidates(mappedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Add a new blank candidate to the list
  const addCandidate = () => {
    setCandidates((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        bio: "",
        position: "",
        imageUrl: "",
        electionId: electionId || "",
        createdAt: new Date().toISOString(),
        studentId: "",
        department: "",
        yearLevel: ""
      }
    ]);
  };

  // Remove a candidate from the list
  const removeCandidate = (index: number) => {
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a candidate field
  const updateCandidate = (index: number, field: keyof Candidate, value: string) => {
    setCandidates((prev) => 
      prev.map((c, i) => 
        i === index 
          ? { ...c, [field]: value } 
          : c
      )
    );
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCandidatesForNewElection: () => {
      return candidates.map(c => ({
        name: c.name,
        bio: c.bio,
        position: c.position,
        image_url: c.imageUrl,
        student_id: c.studentId,
        department: c.department,
        year_level: c.yearLevel
      }));
    }
  }));

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Candidates</h3>
        <Button type="button" variant="outline" size="sm" onClick={addCandidate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>
      
      <div className="space-y-4">
        {candidates.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-md">
            <p className="text-muted-foreground">No candidates added yet. Click "Add Candidate" to get started.</p>
          </div>
        ) : (
          candidates.map((candidate, index) => (
            <Card key={candidate.id} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-2 right-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeCandidate(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-name-${index}`}>Full Name</Label>
                    <Input 
                      id={`candidate-name-${index}`} 
                      value={candidate.name} 
                      onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-studentId-${index}`}>Student ID</Label>
                    <Input 
                      id={`candidate-studentId-${index}`} 
                      value={candidate.studentId || ''}
                      onChange={(e) => updateCandidate(index, 'studentId', e.target.value)}
                      placeholder="e.g., 20120001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-position-${index}`}>Position</Label>
                    <Select 
                      value={candidate.position} 
                      onValueChange={(value) => updateCandidate(index, 'position', value)}
                    >
                      <SelectTrigger id={`candidate-position-${index}`}>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-department-${index}`}>College/Department</Label>
                    <Select 
                      value={candidate.department || ''}
                      onValueChange={(value) => updateCandidate(index, 'department', value)}
                    >
                      <SelectTrigger id={`candidate-department-${index}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DLSU_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-yearLevel-${index}`}>Year Level</Label>
                    <Select 
                      value={candidate.yearLevel || ''}
                      onValueChange={(value) => updateCandidate(index, 'yearLevel', value)}
                    >
                      <SelectTrigger id={`candidate-yearLevel-${index}`}>
                        <SelectValue placeholder="Select year level" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_LEVELS.map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`candidate-bio-${index}`}>Candidate Platform/Bio</Label>
                  <Textarea 
                    id={`candidate-bio-${index}`}
                    value={candidate.bio}
                    onChange={(e) => updateCandidate(index, 'bio', e.target.value)}
                    placeholder="Share this candidate's background, qualifications, and platform"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`candidate-image-${index}`}>Image URL</Label>
                  <Input 
                    id={`candidate-image-${index}`}
                    value={candidate.imageUrl}
                    onChange={(e) => updateCandidate(index, 'imageUrl', e.target.value)}
                    placeholder="Enter an image URL for this candidate"
                  />
                </div>
              </CardContent>
              
              {index < candidates.length - 1 && <Separator className="mt-4" />}
            </Card>
          ))
        )}
      </div>
      
      {candidates.length > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={addCandidate} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another Candidate
        </Button>
      )}
    </div>
  );
});

CandidateManager.displayName = "CandidateManager";

export default CandidateManager;
