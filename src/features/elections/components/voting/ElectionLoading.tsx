
import React from "react";

const ElectionLoading = () => {
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#008f50] border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-xl">Loading election details...</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch the information</p>
    </div>
  );
};

export default ElectionLoading;
