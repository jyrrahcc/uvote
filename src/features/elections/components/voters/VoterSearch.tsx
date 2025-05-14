
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

// DLSU-D Departments for filtering
const DLSU_DEPARTMENTS = [
  "College of Business Administration and Accountancy",
  "College of Education",
  "College of Engineering, Architecture and Technology",
  "College of Humanities, Arts and Social Sciences",
  "College of Science and Computer Studies",
  "College of Criminal Justice Education",
  "College of Tourism and Hospitality Management"
];

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

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
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export { DLSU_DEPARTMENTS, YEAR_LEVELS };
export default VoterSearch;
