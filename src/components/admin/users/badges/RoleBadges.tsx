
import React from "react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Shield, UserCheck } from "lucide-react";

interface RoleBadgesProps {
  roles: string[];
}

const RoleBadges: React.FC<RoleBadgesProps> = ({ roles }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.includes('admin') && (
        <HoverCard>
          <HoverCardTrigger>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-48">
            <p className="text-xs">Admin users can manage all aspects of the platform including elections and users.</p>
          </HoverCardContent>
        </HoverCard>
      )}
      {roles.includes('voter') && (
        <HoverCard>
          <HoverCardTrigger>
            <Badge variant="outline">
              <UserCheck className="h-3 w-3 mr-1" />
              Voter
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-48">
            <p className="text-xs">Voters can participate in elections and view results.</p>
          </HoverCardContent>
        </HoverCard>
      )}
      {roles.length === 0 && (
        <Badge variant="outline" className="text-muted-foreground">
          No roles
        </Badge>
      )}
    </div>
  );
};

export default RoleBadges;
