
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin test credentials 
export const ADMIN_TEST_EMAIL = "admin@uvote.com";
export const ADMIN_TEST_PASSWORD = "password123";

/**
 * Create an admin user for testing purposes
 */
export const createAdminUser = async (): Promise<boolean> => {
  try {
    console.log("Attempting to create admin user:", ADMIN_TEST_EMAIL);
    
    // First check if the user already exists by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });
    
    // If we can sign in, the user exists
    if (!signInError) {
      console.log("Admin user already exists, checking for admin role");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if they have admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        // If admin role is missing, add it
        if (!roleData) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'admin'
            });
          console.log("Added admin role to existing user");
        }
        
        return true;
      }
    }
    
    // Create the admin user if it doesn't exist
    console.log("Creating new admin user...");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
      options: {
        data: {
          first_name: "Admin",
          last_name: "User",
        },
      },
    });
    
    if (signUpError) {
      console.error("Error creating admin user:", signUpError);
      return false;
    }
    
    // Add admin role to the new user
    if (signUpData.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: signUpData.user.id,
          role: 'admin'
        });
      
      if (roleError) {
        console.error("Error setting admin role:", roleError);
        return false;
      }
      
      console.log("Admin user created successfully with ID:", signUpData.user.id);
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
    console.log("Attempting admin login with:", ADMIN_TEST_EMAIL);
    
    // Try to log in directly first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });
    
    if (error) {
      console.error("Admin login failed, trying to create admin first:", error);
      
      // If login fails, try creating the admin and then logging in again
      const adminCreated = await createAdminUser();
      if (!adminCreated) {
        toast.error("Failed to create admin user");
        return false;
      }
      
      // Try logging in again after creating
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: ADMIN_TEST_EMAIL,
        password: ADMIN_TEST_PASSWORD,
      });
      
      if (retryError) {
        toast.error("Failed to login as admin: " + retryError.message);
        console.error("Admin login retry error:", retryError);
        return false;
      }
      
      toast.success("Logged in as admin");
      return true;
    }
    
    console.log("Admin login successful");
    toast.success("Logged in as admin");
    return true;
  } catch (error) {
    console.error("Error in loginAsAdmin:", error);
    toast.error("An unexpected error occurred while logging in as admin");
    return false;
  }
};

/**
 * Get all admin users from the database
 */
export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('role', 'admin');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
};
