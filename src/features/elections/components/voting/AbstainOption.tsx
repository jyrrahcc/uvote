
import React from "react";
import { FormLabel, FormItem, FormControl } from "@/components/ui/form";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { CircleX } from "lucide-react";

interface AbstainOptionProps {
  onAbstain?: () => void;
}

const AbstainOption = ({ onAbstain }: AbstainOptionProps) => {
  return (
    <FormItem className="flex items-center space-x-3 space-y-0 mt-2 border border-gray-200 p-3 rounded-md hover:bg-gray-50 transition-colors">
      <FormControl>
        <RadioGroupItem 
          value="abstain" 
          className="border-gray-400"
        />
      </FormControl>
      <FormLabel className="font-normal cursor-pointer flex items-center w-full">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <CircleX className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <div className="font-medium">Abstain</div>
            <div className="text-sm text-muted-foreground">
              I choose not to vote for this position
            </div>
          </div>
        </div>
      </FormLabel>
    </FormItem>
  );
};

export default AbstainOption;
