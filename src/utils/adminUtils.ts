
import { Election, Candidate, User } from "@/types";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Mail, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ReactNode } from "react";

/**
 * Get the appropriate status badge for an election
 */
export const getStatusBadge = (status: string) => {
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
export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Admin</span>;
    case 'user':
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">User</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{role}</span>;
  }
};

/**
 * Format a date string to be more readable
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Share an election via various methods
 */
export const shareElection = (election: Election) => {
  const shareUrl = `${window.location.origin}/elections/${election.id}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        description: "Link copied to clipboard",
      });
    });
  };
  
  const shareByEmail = () => {
    const subject = encodeURIComponent(`Vote in "${election.title}"`);
    const body = encodeURIComponent(
      `You're invited to vote in "${election.title}".\n\n` +
      `Please visit: ${shareUrl}\n\n` +
      `The election is open from ${formatDate(election.startDate)} to ${formatDate(election.endDate)}.` +
      (election.isPrivate ? `\n\nAccess Code: ${election.accessCode}` : '')
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
  };
  
  return {
    copyToClipboard,
    shareByEmail,
    openInNewTab,
    buttons: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        <Button variant="outline" size="sm" onClick={shareByEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open
        </Button>
      </div>
    )
  };
};

/**
 * Generate a random access code for private elections
 */
export const generateAccessCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create custom toast notifications
export const notifySuccess = (message: ReactNode) => {
  toast({
    description: message,
    className: "bg-green-50 border-green-200 text-green-800"
  });
};

export const notifyError = (message: ReactNode) => {
  toast({
    description: message,
    className: "bg-red-50 border-red-200 text-red-800"
  });
};

export const notifyInfo = (message: ReactNode) => {
  toast({
    description: message
  });
};

export const notifyWarning = (message: ReactNode) => {
  toast({
    description: message,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800"
  });
};
