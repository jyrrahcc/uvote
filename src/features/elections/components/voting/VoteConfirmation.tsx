
import React from "react";

const VoteConfirmation = () => {
  return (
    <div className="text-center py-8 border rounded-md bg-green-50">
      <div className="text-2xl font-semibold text-green-700 mb-2">Thank you for voting!</div>
      <p className="text-green-600">Your vote has been recorded. Results will be available when the election closes.</p>
    </div>
  );
};

export default VoteConfirmation;
