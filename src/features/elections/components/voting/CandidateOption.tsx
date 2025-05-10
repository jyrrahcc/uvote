
import React from "react";
import { FormLabel, FormItem, FormControl } from "@/components/ui/form";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Candidate } from "@/types";

interface CandidateOptionProps {
  candidate: Candidate;
}

const CandidateOption = ({ candidate }: CandidateOptionProps) => {
  return (
    <FormItem className="flex items-center space-x-3 space-y-0">
      <FormControl>
        <RadioGroupItem value={candidate.id} />
      </FormControl>
      <FormLabel className="font-normal cursor-pointer flex items-center">
        {candidate.image_url && (
          <img 
            src={candidate.image_url} 
            alt={candidate.name} 
            className="w-10 h-10 rounded-full object-cover mr-3" 
          />
        )}
        <div>
          <div className="font-medium">{candidate.name}</div>
          {candidate.bio && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {candidate.bio}
            </div>
          )}
        </div>
      </FormLabel>
    </FormItem>
  );
};

export default CandidateOption;
