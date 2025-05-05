import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin test credentials - Using a properly formatted email
export const ADMIN_TEST_EMAIL = "admin@example.com";
export const ADMIN_TEST_PASSWORD = "password123";

/**
 * Create an admin user for testing purposes
 */
export const createAdminUser = async (): Promise<boolean> => {
  try {
    console.log("Attempting to create admin user:", ADMIN_TEST_EMAIL);
    
    // First try to create the user - if they exist, this will fail
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
    
    if (signUpError && !signUpError.message.includes("already registered")) {
      // If there's an error other than "user already exists", log it and return false
      console.error("Error creating admin user:", signUpError);
      return false;
    }
    
    let userId: string;
    
    // If we successfully created a user, use that ID
    if (signUpData?.user) {
      userId = signUpData.user.id;
      console.log("Admin user created with ID:", userId);
    } else {
      // Otherwise, try to sign in to get the existing user ID
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_TEST_EMAIL,
        password: ADMIN_TEST_PASSWORD,
      });
      
      if (signInError) {
        console.error("Error signing in as admin:", signInError);
        return false;
      }
      
      if (!signInData?.user) {
        console.error("Could not get user data after signin");
        return false;
      }
      
      userId = signInData.user.id;
      console.log("Retrieved existing admin user with ID:", userId);
    }
    
    // Check if admin role already exists for this user
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleCheckError) {
      console.error("Error checking for admin role:", roleCheckError);
    }
    
    // Add admin role if it doesn't exist
    if (!existingRole) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });
      
      if (roleError) {
        console.error("Error setting admin role:", roleError);
        return false;
      }
      
      console.log("Added admin role to user");
    } else {
      console.log("User already has admin role");
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error in createAdminUser:", error);
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
