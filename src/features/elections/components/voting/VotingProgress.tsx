
import React from "react";
import { Progress } from "@/components/ui/progress";

interface VotingProgressProps {
  currentPosition: number;
  totalPositions: number;
}

const VotingProgress = ({ currentPosition, totalPositions }: VotingProgressProps) => {
  // Calculate progress percentage
  const progressPercentage = ((currentPosition + 1) / totalPositions) * 100;
  
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
        
        <div className="flex justify-center items-center gap-1 mt-1">
          {Array.from({ length: totalPositions }).map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index <= currentPosition 
                  ? 'bg-[#008f50]' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default VotingProgress;
