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
 * Add a simple RPC function to check if a column exists in a table
 */
export const createGetColumnInfoFunction = async () => {
  try {
    const { error } = await supabase.rpc('get_column_info', { 
      table_name: 'votes',
      column_name: 'id'
    });
    
    // If we get a specific error about the function not existing, create it
    if (error && error.message.includes('does not exist')) {
      const { error: createError } = await supabase.rpc('create_get_column_info_function');
      
      if (createError) {
        console.error('Failed to create get_column_info function:', createError);
        return false;
      }
      
      return true;
    }
    
    // Function already exists
    return true;
  } catch (error) {
    console.error('Error checking column info function:', error);
    return false;
  }
};
