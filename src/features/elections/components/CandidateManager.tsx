
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Plus, Upload, Image, X, Eye } from "lucide-react";
import { Candidate, mapDbCandidateToCandidate } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export interface CandidateManagerProps {
  electionId: string | null;
  isNewElection: boolean;
  candidacyStartDate?: string;
  candidacyEndDate?: string;
  isAdmin?: boolean;
  positions?: string[];
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

const DEFAULT_POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Public Relations Officer",
  "Senator",
  "Governor",
  "Department Representative"
];

const CandidateManager = forwardRef(({ 
  electionId, 
  isNewElection, 
  candidacyStartDate, 
  candidacyEndDate,
  isAdmin = false,
  positions = []
}: CandidateManagerProps, ref) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize positions
  useEffect(() => {
    if (positions && positions.length > 0) {
      setAvailablePositions(positions);
    } else {
      // If no positions provided, use defaults
      setAvailablePositions(DEFAULT_POSITIONS);
    }
  }, [positions]);

  // Fetch candidates if editing an existing election
  useEffect(() => {
    if (electionId && !isNewElection) {
      fetchCandidates();
    }
  }, [electionId, isNewElection]);

  // Also fetch election positions if election ID is provided
  useEffect(() => {
    if (electionId && !isNewElection) {
      fetchElectionPositions();
    }
  }, [electionId, isNewElection]);

  const fetchElectionPositions = async () => {
    if (!electionId) return;
    
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('positions')
        .eq('id', electionId)
        .single();
      
      if (error) throw error;

      if (data && data.positions && Array.isArray(data.positions) && data.positions.length > 0) {
        setAvailablePositions(data.positions);
      }
    } catch (error) {
      console.error("Error fetching election positions:", error);
    }
  };

  const fetchCandidates = async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      
      if (error) throw error;

      const processedCandidates = data.map(candidate => mapDbCandidateToCandidate(candidate));
      setCandidates(processedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Check if current date is within candidacy period
  // Admin can always add candidates regardless of candidacy period
  const isInCandidacyPeriod = () => {
    // If it's a new election or the user is an admin, always allow adding candidates
    if (isNewElection || isAdmin) return true;
    
    // For non-admin users, check if within candidacy period
    // If candidacy dates are not set, we can't determine
    if (!candidacyStartDate || !candidacyEndDate) return false;
    
    const now = new Date();
    const startDate = new Date(candidacyStartDate);
    const endDate = new Date(candidacyEndDate);
    
    return now >= startDate && now <= endDate;
  };

  // Add a new blank candidate to the list
  const addCandidate = () => {
    // Check if in candidacy period for existing elections (only for non-admin users)
    if (!isAdmin && !isNewElection && !isInCandidacyPeriod()) {
      toast.error("Candidates can only be added during the candidacy period");
      return;
    }

    setCandidates(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        bio: "",
        position: "",
        image_url: "",
        election_id: electionId || ""
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

  // Preview image
  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setShowPreview(true);
  };

  // Handle campaign poster upload
  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !electionId) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `candidate-posters/${electionId}/${fileName}`;

    try {
      setUploading(prev => ({ ...prev, [index]: true }));
      
      // Create a temporary preview URL
      const objectUrl = URL.createObjectURL(file);
      updateCandidate(index, 'image_url', objectUrl);
      
      console.log("Uploading file to posters bucket:", filePath);
      
      // Upload the file to Supabase storage - using the 'posters' bucket we created
      const { error: uploadError, data } = await supabase.storage
        .from('posters')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully, getting public URL");

      // Get the public URL from the 'posters' bucket
      const { data: publicURL } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);
      
      if (!publicURL || !publicURL.publicUrl) {
        console.error("Could not get public URL");
        throw new Error('Could not generate public URL');
      }

      console.log("Public URL obtained:", publicURL.publicUrl);

      // Update the candidate state with the new image URL
      updateCandidate(index, 'image_url', publicURL.publicUrl);
      
      toast.success("Campaign poster uploaded successfully");
    } catch (error) {
      console.error("Error uploading poster:", error);
      toast.error("Failed to upload campaign poster: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getCandidatesForNewElection: () => {
      return candidates.map(c => ({
        name: c.name,
        bio: c.bio,
        position: c.position,
        image_url: c.image_url,
        student_id: c.student_id,
        department: c.department,
        year_level: c.year_level,
        election_id: electionId // Explicitly set the election_id
      }));
    }
  }));

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  // Show a message about candidacy period only for non-admin users
  const candidacyMessage = !isAdmin && !isNewElection && !isInCandidacyPeriod() ? (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md mb-4">
      Candidates can only be added during the candidacy period ({candidacyStartDate ? new Date(candidacyStartDate).toLocaleDateString() : "Not set"} - 
      {candidacyEndDate ? new Date(candidacyEndDate).toLocaleDateString() : "Not set"}).
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Candidates</h3>
        {(isNewElection || isAdmin || isInCandidacyPeriod()) && (
          <Button type="button" variant="outline" size="sm" onClick={addCandidate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        )}
      </div>
      
      {candidacyMessage}
      
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
                      value={candidate.student_id || ''}
                      onChange={(e) => updateCandidate(index, 'student_id', e.target.value)}
                      placeholder="e.g., 20120001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`candidate-position-${index}`}>Position</Label>
                    {availablePositions.length > 0 ? (
                      <Select 
                        value={candidate.position} 
                        onValueChange={(value) => updateCandidate(index, 'position', value)}
                      >
                        <SelectTrigger id={`candidate-position-${index}`}>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePositions.map((pos) => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        id={`candidate-position-${index}`} 
                        value={candidate.position} 
                        onChange={(e) => updateCandidate(index, 'position', e.target.value)}
                        placeholder="Position running for"
                      />
                    )}
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
                      value={candidate.year_level || ''}
                      onValueChange={(value) => updateCandidate(index, 'year_level', value)}
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
                    value={candidate.bio || ''}
                    onChange={(e) => updateCandidate(index, 'bio', e.target.value)}
                    placeholder="Share this candidate's background, qualifications, and platform"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="mt-4">
                  <div className="space-y-2">
                    <Label>Campaign Poster</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById(`poster-upload-${index}`)?.click()}
                          disabled={uploading[index]}
                          className="flex-1"
                        >
                          <Image className="mr-2 h-4 w-4" />
                          {uploading[index] ? "Uploading..." : "Upload Poster"}
                        </Button>
                        
                        {candidate.image_url && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handlePreviewImage(candidate.image_url)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <Input 
                        id={`poster-upload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(index, e)}
                        disabled={uploading[index]}
                      />
                      
                      {candidate.image_url && (
                        <div className="mt-2 relative w-full h-48 border rounded-md overflow-hidden">
                          <img 
                            src={candidate.image_url} 
                            alt="Campaign poster preview" 
                            className="w-full h-full object-cover"
                          />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => updateCandidate(index, 'image_url', '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {index < candidates.length - 1 && <Separator className="mt-4" />}
            </Card>
          ))
        )}
      </div>
      
      {candidates.length > 0 && (isNewElection || isAdmin || isInCandidacyPeriod()) && (
        <Button type="button" variant="outline" size="sm" onClick={addCandidate} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Another Candidate
        </Button>
      )}
      
      {/* Image Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
});

CandidateManager.displayName = "CandidateManager";

export default CandidateManager;
