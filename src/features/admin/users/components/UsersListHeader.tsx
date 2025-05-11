
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import UserSearchAndFilters from "@/components/admin/users/UserSearchAndFilters";

interface UsersListHeaderProps {
  usersCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentTab: string;
  onTabChange: (value: string) => void;
  verificationFilter: "all" | "verified" | "unverified";
  onVerificationFilterChange: (value: "all" | "verified" | "unverified") => void;
}

export const UsersListHeader: React.FC<UsersListHeaderProps> = ({
  usersCount,
  searchTerm,
  onSearchChange,
  currentTab,
  onTabChange,
  verificationFilter,
  onVerificationFilterChange
}) => {
  return (
    <>
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage users and their roles in the system
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {usersCount} user{usersCount !== 1 ? 's' : ''} registered
              </CardDescription>
            </div>
            
            <UserSearchAndFilters 
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              currentTab={currentTab}
              onTabChange={onTabChange}
              verificationFilter={verificationFilter}
              onVerificationFilterChange={onVerificationFilterChange}
            />
          </div>
        </CardHeader>
      </Card>
    </>
  );
};
