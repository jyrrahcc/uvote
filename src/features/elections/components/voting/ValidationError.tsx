
import React from "react";

interface ValidationErrorProps {
  error: string | null;
}

const ValidationError = ({ error }: ValidationErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
      {error}
    </div>
  );
};

export default ValidationError;
