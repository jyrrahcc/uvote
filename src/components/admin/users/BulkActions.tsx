
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Download, Users } from "lucide-react";
import { UserProfile } from "./types";

interface BulkActionsProps {
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  users: UserProfile[];
  onBulkVerify: (userIds: string[], verify: boolean) => void;
  onExport: (userIds: string[]) => void;
  isProcessing: boolean;
}

const BulkActions = ({
  selectedUsers,
  onSelectionChange,
  users,
  onBulkVerify,
  onExport,
  isProcessing
}: BulkActionsProps) => {
  const allUserIds = users.map(u => u.id);
  const isAllSelected = selectedUsers.length === users.length && users.length > 0;
  const isPartiallySelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allUserIds);
    }
  };

  const selectedUsersData = users.filter(u => selectedUsers.includes(u.id));
  const verifiedCount = selectedUsersData.filter(u => u.roles.includes('voter')).length;
  const unverifiedCount = selectedUsers.length - verifiedCount;

  if (users.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isPartiallySelected ? "data-[state=checked]:bg-orange-500" : ""}
              />
              <span className="text-sm font-medium">
                {selectedUsers.length} of {users.length} selected
              </span>
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedUsers.length}
                </Badge>
                <Badge variant="outline" className="text-xs text-green-600">
                  <UserCheck className="h-3 w-3 mr-1" />
                  {verifiedCount} verified
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-600">
                  <UserX className="h-3 w-3 mr-1" />
                  {unverifiedCount} unverified
                </Badge>
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {unverifiedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkVerify(selectedUsers, true)}
                  disabled={isProcessing}
                  className="text-green-600 hover:text-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Verify ({unverifiedCount})
                </Button>
              )}
              
              {verifiedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkVerify(selectedUsers, false)}
                  disabled={isProcessing}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Unverify ({verifiedCount})
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport(selectedUsers)}
                disabled={isProcessing}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActions;
