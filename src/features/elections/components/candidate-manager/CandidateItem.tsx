
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Image, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { UNKNOWN_DEPARTMENT, UNKNOWN_POSITION, UNKNOWN_YEAR } from "@/types/constants";

interface CandidateItemProps {
  candidate: Candidate;
  index: number;
  onUpdate: (index: number, field: keyof Candidate, value: string) => void;
  onRemove: (index: number) => void;
  positions: string[];
  departments: string[];
  yearLevels: string[];
  onPreviewImage: (url: string) => void;
}

const CandidateItem = ({
  candidate,
  index,
  onUpdate,
  onRemove,
  positions,
  departments,
  yearLevels,
  onPreviewImage
}: CandidateItemProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `candidate-posters/${candidate.election_id}/${fileName}`;

    try {
      setUploading(true);
      
      // Create a temporary preview URL
      const objectUrl = URL.createObjectURL(file);
      onUpdate(index, 'image_url', objectUrl);
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);
      
      if (!publicURL || !publicURL.publicUrl) {
        throw new Error('Could not generate public URL');
      }

      // Update the candidate with the new image URL
      onUpdate(index, 'image_url', publicURL.publicUrl);
      toast.success("Campaign poster uploaded successfully");
    } catch (error) {
      console.error("Error uploading poster:", error);
      toast.error("Failed to upload campaign poster: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="relative">
      <CardContent className="pt-6">
        <div className="absolute top-2 right-2">
          <Button 
            type="button"
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(index)}
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
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              placeholder="Full Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`candidate-studentId-${index}`}>Student ID</Label>
            <Input 
              id={`candidate-studentId-${index}`} 
              value={candidate.student_id || ''}
              onChange={(e) => onUpdate(index, 'student_id', e.target.value)}
              placeholder="e.g., 20120001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`candidate-position-${index}`}>Position</Label>
            {positions.length > 0 ? (
              <Select 
                value={candidate.position || UNKNOWN_POSITION} 
                onValueChange={(value) => onUpdate(index, 'position', value)}
              >
                <SelectTrigger id={`candidate-position-${index}`}>
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos || UNKNOWN_POSITION}>{pos || "Unknown Position"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                id={`candidate-position-${index}`} 
                value={candidate.position || ''} 
                onChange={(e) => onUpdate(index, 'position', e.target.value)}
                placeholder="Position running for"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`candidate-department-${index}`}>College/Department</Label>
            <Select 
              value={candidate.department || UNKNOWN_DEPARTMENT}
              onValueChange={(value) => onUpdate(index, 'department', value)}
            >
              <SelectTrigger id={`candidate-department-${index}`}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept || UNKNOWN_DEPARTMENT}>{dept || "Unknown Department"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`candidate-yearLevel-${index}`}>Year Level</Label>
            <Select 
              value={candidate.year_level || UNKNOWN_YEAR}
              onValueChange={(value) => onUpdate(index, 'year_level', value)}
            >
              <SelectTrigger id={`candidate-yearLevel-${index}`}>
                <SelectValue placeholder="Select year level" />
              </SelectTrigger>
              <SelectContent>
                {yearLevels.map((year) => (
                  <SelectItem key={year} value={year || UNKNOWN_YEAR}>{year || "Unknown Year"}</SelectItem>
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
            onChange={(e) => onUpdate(index, 'bio', e.target.value)}
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
                  disabled={uploading}
                  className="flex-1"
                >
                  <Image className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Poster"}
                </Button>
                
                {candidate.image_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onPreviewImage(candidate.image_url!)}
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
                onChange={(e) => handleImageUpload(e)}
                disabled={uploading}
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
                    onClick={() => onUpdate(index, 'image_url', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateItem;
