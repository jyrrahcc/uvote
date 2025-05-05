
import { ReactNode } from "react";
import { formatDate } from "../dateUtils";

/**
 * Get the appropriate status badge for an election
 */
export const getStatusBadge = (status: string): ReactNode => {
  switch (status) {
    case 'active':
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>;
    case 'upcoming':
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Upcoming</span>;
    case 'completed':
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Completed</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
  }
};

/**
 * Get the appropriate role badge for a user
 */
export const getRoleBadge = (role: string): ReactNode => {
  switch (role) {
    case 'admin':
      return <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Admin</span>;
    case 'user':
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">User</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{role}</span>;
  }
};
