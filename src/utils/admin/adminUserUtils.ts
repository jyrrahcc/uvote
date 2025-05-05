
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin test credentials
export const ADMIN_TEST_EMAIL = "admin@test.com"; // Using a more valid test email
export const ADMIN_TEST_PASSWORD = "password123";

/**
 * Create an admin user for testing purposes
 */
export const createAdminUser = async (): Promise<boolean> => {
  try {
    // Check if admin user already exists in auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });
    
    // If sign in works, admin exists already
    if (data.user) {
      console.log("Admin user already exists");
      await supabase.auth.signOut(); // Sign out after checking
      return true;
    }
    
    // Create the admin user if it doesn't exist (signIn will fail)
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
      // If the user already exists, that's fine
      if (signUpError.message.includes("already registered")) {
        return true;
      }
      return false;
    }
    
    // Set the user role to admin
    if (signUpData.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: signUpData.user.id,
          role: 'admin'
        })
        .select()
        .single();
      
      if (roleError) {
        // Check if error is due to unique constraint (role already assigned)
        if (roleError.code === '23505') {
          console.log("Admin role already assigned");
        } else {
          console.error("Error setting admin role:", roleError);
          return false;
        }
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
    // First make sure the admin user exists
    await createAdminUser();
    
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });
    
    if (error) {
      toast.error("Failed to login as admin: " + error.message);
      console.error("Admin login error:", error);
      return false;
    }
    
    toast.success("Logged in as admin");
    return true;
  } catch (error) {
    console.error("Error in loginAsAdmin:", error);
    toast.error("An unexpected error occurred while logging in as admin");
    return false;
  }
};
