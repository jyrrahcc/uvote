
import { useState } from "react";
import { UserProfile } from "@/components/admin/users/types";

export const useUserFiltersAndSort = (users: UserProfile[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentTab, setCurrentTab] = useState("all");
  
  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.student_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (currentTab === 'all') return matchesSearch;
      if (currentTab === 'admins') return matchesSearch && user.roles.includes('admin');
      if (currentTab === 'voters') return matchesSearch && user.roles.includes('voter');
      
      return matchesSearch;
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
      
      return 0;
    });

  return {
    searchTerm,
    setSearchTerm,
    sortColumn,
    sortDirection,
    currentTab,
    setCurrentTab,
    handleSort,
    filteredUsers
  };
};
