
import { useState, useMemo } from "react";
import { UserProfile } from "@/components/admin/users/types";

export const useUserFiltersAndSort = (users: UserProfile[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentTab, setCurrentTab] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  
  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        // Filter by search term
        const matchesSearch = 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by role tab
        const matchesRoleTab = 
          currentTab === 'all' ? true :
          currentTab === 'admins' ? user.roles.includes('admin') :
          currentTab === 'voters' ? user.roles.includes('voter') :
          true;
        
        // Filter by verification status using voter role
        const isVerified = user.roles.includes('voter');
        const matchesVerification = 
          verificationFilter === 'all' ? true :
          verificationFilter === 'verified' ? isVerified :
          !isVerified;
        
        return matchesSearch && matchesRoleTab && matchesVerification;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        
        if (sortColumn === "name") {
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return nameA.localeCompare(nameB) * direction;
        }
        
        if (sortColumn === "email") {
          return a.email.localeCompare(b.email) * direction;
        }
        
        if (sortColumn === "created_at") {
          return new Date(a.created_at).getTime() > new Date(b.created_at).getTime() 
            ? direction 
            : -direction;
        }
        
        if (sortColumn === "department") {
          const deptA = (a.department || '').toLowerCase();
          const deptB = (b.department || '').toLowerCase();
          return deptA.localeCompare(deptB) * direction;
        }
        
        if (sortColumn === "year_level") {
          const yearA = (a.year_level || '').toLowerCase();
          const yearB = (b.year_level || '').toLowerCase();
          return yearA.localeCompare(yearB) * direction;
        }
        
        return 0;
      });
  }, [users, searchTerm, sortColumn, sortDirection, currentTab, verificationFilter]);

  return {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    currentTab,
    setCurrentTab,
    verificationFilter,
    setVerificationFilter,
    handleSort,
    filteredUsers
  };
};
