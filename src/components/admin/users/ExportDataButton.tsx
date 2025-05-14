
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/admin/users/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FileText, Download, Check } from "lucide-react";

interface ExportDataButtonProps {
  users: UserProfile[];
}

const ExportDataButton: React.FC<ExportDataButtonProps> = ({ users }) => {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  
  const formatCSV = (data: UserProfile[]): string => {
    // Define CSV headers
    const headers = [
      'ID',
      'Email',
      'First Name',
      'Last Name',
      'Student ID',
      'Department',
      'Year Level',
      'Roles',
      'Verified',
      'Created At'
    ].join(',');
    
    // Format each row of data
    const rows = data.map(user => [
      user.id,
      user.email,
      user.first_name,
      user.last_name,
      user.student_id || '',
      user.department || '',
      user.year_level || '',
      user.roles.join(';'),
      user.roles.includes('voter') ? 'Yes' : 'No', // Use voter role to determine verification status
      new Date(user.created_at).toLocaleString()
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    
    // Combine headers and rows
    return [headers, ...rows].join('\n');
  };
  
  const handleExportCSV = () => {
    try {
      setExportStatus('csv');
      
      // Format data as CSV
      const csvContent = formatCSV(users);
      
      // Create a Blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Set up and trigger download
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset status after a short delay
      setTimeout(() => setExportStatus(null), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus(null);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          <span>Export as CSV</span>
          {exportStatus === 'csv' && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDataButton;
