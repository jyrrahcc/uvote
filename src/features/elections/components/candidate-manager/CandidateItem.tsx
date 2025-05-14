
import { Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Candidate } from "@/types";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`candidate-name-${index}`}>
            Name*
          </label>
          <Input
            id={`candidate-name-${index}`}
            value={candidate.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Candidate's full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`candidate-position-${index}`}>
            Position*
          </label>
          <Select
            value={candidate.position || ""}
            onValueChange={(value) => onUpdate(index, "position", value)}
          >
            <SelectTrigger id={`candidate-position-${index}`}>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem 
                  key={position || "unknown-position"} 
                  value={position || "unknown-position"}
                >
                  {position || "Unknown Position"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`candidate-department-${index}`}>
            Department
          </label>
          <Select
            value={candidate.department || ""}
            onValueChange={(value) => onUpdate(index, "department", value)}
          >
            <SelectTrigger id={`candidate-department-${index}`}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem 
                  key={dept || "unknown-department"} 
                  value={dept || "unknown-department"}
                >
                  {dept || "Unknown Department"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`candidate-year-${index}`}>
            Year Level
          </label>
          <Select
            value={candidate.year_level || ""}
            onValueChange={(value) => onUpdate(index, "year_level", value)}
          >
            <SelectTrigger id={`candidate-year-${index}`}>
              <SelectValue placeholder="Select year level" />
            </SelectTrigger>
            <SelectContent>
              {yearLevels.map((year) => (
                <SelectItem 
                  key={year || "unknown-year"} 
                  value={year || "unknown-year"}
                >
                  {year || "Unknown Year"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`candidate-bio-${index}`}>
            Bio
          </label>
          <Textarea
            id={`candidate-bio-${index}`}
            value={candidate.bio || ""}
            onChange={(e) => onUpdate(index, "bio", e.target.value)}
            placeholder="Candidate's bio or platform statement"
            className="h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`candidate-image-${index}`}>
            Image URL
          </label>
          <div className="flex gap-2">
            <Input
              id={`candidate-image-${index}`}
              value={candidate.image_url || ""}
              onChange={(e) => onUpdate(index, "image_url", e.target.value)}
              placeholder="URL to candidate's image"
              className="flex-1"
            />
            {candidate.image_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPreviewImage(candidate.image_url || "")}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateItem;
