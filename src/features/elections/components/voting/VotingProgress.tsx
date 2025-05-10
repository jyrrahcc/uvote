
import React from "react";

interface VotingProgressProps {
  currentPosition: number;
  totalPositions: number;
}

const VotingProgress = ({ currentPosition, totalPositions }: VotingProgressProps) => {
  return (
    <>
      <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
        <div 
          className="bg-[#008f50] h-2 rounded-full transition-all" 
          style={{ width: `${(currentPosition + 1) / totalPositions * 100}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center w-full mt-1">
        {currentPosition + 1} of {totalPositions} positions
      </div>
    </>
  );
};

export default VotingProgress;
