
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, UserX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentTab: string;
  onTabChange: (value: string) => void;
  verificationFilter: "all" | "verified" | "unverified";
  onVerificationFilterChange: (value: "all" | "verified" | "unverified") => void;
}

const UserSearchAndFilters = ({
  searchTerm,
  onSearchChange,
  currentTab,
  onTabChange,
  verificationFilter,
  onVerificationFilterChange
}: UserSearchAndFiltersProps) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <Select 
          value={verificationFilter} 
          onValueChange={(value) => onVerificationFilterChange(value as "all" | "verified" | "unverified")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified" className="flex items-center">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                Verified
              </div>
            </SelectItem>
            <SelectItem value="unverified">
              <div className="flex items-center">
                <UserX className="h-4 w-4 mr-2 text-amber-600" />
                Unverified
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="voters">Voters</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default UserSearchAndFilters;
