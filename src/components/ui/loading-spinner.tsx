
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#008f50] border-t-transparent rounded-full"></div>
      <div className="mt-4 text-lg text-muted-foreground">Loading...</div>
    </div>
  );
};

export default LoadingSpinner;
