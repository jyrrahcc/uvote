
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to format dates consistently across the application
 */
export const formatDate = (dateString: string): string => {
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
 * Helper function to truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Generate a random access code for elections
 */
export const generateAccessCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Check if a column exists in a table - simplified approach
 */
export const checkColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Attempt to query the table with the column
    // Use a direct query instead of an RPC function that doesn't exist
    const { error } = await supabase
      .from(tableName as any)
      .select(columnName)
      .limit(1);
    
    // If no error, the column exists
    if (!error) return true;
    
    // If error message indicates column doesn't exist
    if (error.message && error.message.includes(`column "${columnName}" does not exist`)) {
      return false;
    }
    
    // For other errors, log and assume column doesn't exist
    console.error("Error checking column existence:", error);
    return false;
  } catch (error) {
    console.error("Exception checking column existence:", error);
    return false;
  }
};
