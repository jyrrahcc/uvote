
import React from "react";

const LoadingState = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-xl mb-2">Loading...</div>
        <p className="text-sm text-muted-foreground">Please wait while we fetch the election details.</p>
      </div>
    </div>
  );
};

export default LoadingState;
