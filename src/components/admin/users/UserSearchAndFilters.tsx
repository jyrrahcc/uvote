
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

interface UserSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentTab: string;
  onTabChange: (value: string) => void;
}

const UserSearchAndFilters = ({
  searchTerm,
  onSearchChange,
  currentTab,
  onTabChange
}: UserSearchAndFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full sm:w-auto">
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
