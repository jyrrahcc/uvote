
import { Election, Candidate, User } from "@/types";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Mail, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Admin test credentials
export const ADMIN_TEST_EMAIL = "admin@example.com";
export const ADMIN_TEST_PASSWORD = "password123";

/**
 * Create an admin user for testing purposes
 */
export const createAdminUser = async (): Promise<boolean> => {
  try {
    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_TEST_EMAIL)
      .single();
    
    if (existingUser) {
      return true; // Admin already exists
    }
    
    // Create the admin user
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });
    
    if (error) {
      console.error("Error creating admin user:", error);
      return false;
    }
    
    // Set the user role to admin
    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: 'admin'
        });
      
      if (roleError) {
        console.error("Error setting admin role:", roleError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in createAdminUser:", error);
    return false;
  }
};

/**
 * Login as admin for testing purposes
 */
export const loginAsAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });
    
    if (error) {
      toast.error("Failed to login as admin");
      console.error("Admin login error:", error);
      return false;
    }
    
    toast.success("Logged in as admin");
    return true;
  } catch (error) {
    console.error("Error in loginAsAdmin:", error);
    return false;
  }
};

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
      toast("Link copied to clipboard");
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
  toast(message);
};

export const notifyError = (message: ReactNode) => {
  toast(message);
};

export const notifyInfo = (message: ReactNode) => {
  toast(message);
};

export const notifyWarning = (message: ReactNode) => {
  toast(message);
};
