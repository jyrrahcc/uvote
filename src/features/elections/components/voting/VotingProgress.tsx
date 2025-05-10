
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface VotingProgressProps {
  currentPosition: number;
  totalPositions: number;
  selections?: Record<string, string>;
  positions?: string[];
}

const VotingProgress = ({ 
  currentPosition, 
  totalPositions,
  selections = {},
  positions = []
}: VotingProgressProps) => {
  // Calculate progress percentage
  const completedSelections = Object.keys(selections).length;
  const progressPercentage = (completedSelections / totalPositions) * 100;
  
  return (
    <>
      <div className="w-full flex flex-col items-center gap-2">
        <div className="w-full flex justify-between text-xs text-muted-foreground mb-1">
          <span>Start</span>
          <span>Position {currentPosition + 1} of {totalPositions}</span>
          <span>Complete</span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 w-full" 
        />
        
        <div className="flex justify-between items-center w-full mt-3 px-1">
          <div className="text-xs text-muted-foreground">
            {completedSelections}/{totalPositions} positions selected
          </div>
          
          {positions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {positions.map((position, index) => (
                <div 
                  key={position}
                  className="flex items-center text-xs"
                >
                  <span className={`size-4 rounded-full flex items-center justify-center mr-1 ${
                    selections[position] 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {selections[position] ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      index + 1
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VotingProgress;
