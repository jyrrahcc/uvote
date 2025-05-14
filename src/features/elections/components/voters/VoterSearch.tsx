
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DLSU_DEPARTMENTS, YEAR_LEVELS, UNKNOWN_DEPARTMENT, UNKNOWN_YEAR } from "@/features/elections/components/candidate-manager/constants";

interface VoterSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  departmentFilter: string | null;
  setDepartmentFilter: (department: string | null) => void;
  yearFilter: string | null;
  setYearFilter: (year: string | null) => void;
}

const VoterSearch = ({
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  yearFilter,
  setYearFilter
}: VoterSearchProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="search-voters" className="text-sm font-medium mb-2 block">
          Search Users
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            id="search-voters"
            placeholder="Search by name, email or student ID"
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="w-full md:w-48">
        <label htmlFor="dept-filter" className="text-sm font-medium mb-2 block">
          Filter by College/Department
        </label>
        <Select 
          value={departmentFilter || "all"} 
          onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
        >
          <SelectTrigger id="dept-filter">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DLSU_DEPARTMENTS.map(dept => (
              <SelectItem 
                key={dept || UNKNOWN_DEPARTMENT} 
                value={dept || UNKNOWN_DEPARTMENT}
              >
                {dept || "Unknown Department"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-32">
        <label htmlFor="year-filter" className="text-sm font-medium mb-2 block">
          Filter by Year Level
        </label>
        <Select 
          value={yearFilter || "all"} 
          onValueChange={(value) => setYearFilter(value === "all" ? null : value)}
        >
          <SelectTrigger id="year-filter">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {YEAR_LEVELS.map(year => (
              <SelectItem 
                key={year || UNKNOWN_YEAR} 
                value={year || UNKNOWN_YEAR}
              >
                {year || "Unknown Year"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VoterSearch;
