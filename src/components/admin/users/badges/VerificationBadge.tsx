
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Info } from "lucide-react";

interface VerificationBadgeProps {
  isVerified: boolean;
  hasVoterRole?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  isVerified,
  hasVoterRole = false 
}) => {
  // If user has voter role, they're considered verified regardless of is_verified flag
  const isEffectivelyVerified = isVerified || hasVoterRole;
  
  return isEffectivelyVerified ? (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      <Check className="h-3 w-3 mr-1" />
      Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      <Info className="h-3 w-3 mr-1" />
      Not Verified
    </Badge>
  );
};

export default VerificationBadge;
