
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PositionSelectorProps {
  position: string;
  setPosition: (position: string) => void;
  availablePositions: string[];
  required?: boolean;
}

const PositionSelector = ({ 
  position, 
  setPosition, 
  availablePositions,
  required = true
}: PositionSelectorProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="position" className="text-right">
        Position
      </Label>
      {availablePositions.length > 0 ? (
        <div className="col-span-3">
          <Select
            value={position || "select-position"} // Ensure value is never empty
            onValueChange={setPosition}
            required={required}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a position" />
            </SelectTrigger>
            <SelectContent>
              {availablePositions.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Input
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="col-span-3"
          placeholder="Enter position"
          required={required}
        />
      )}
    </div>
  );
};

export default PositionSelector;
