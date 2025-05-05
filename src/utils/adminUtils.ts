
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin test credentials
export const ADMIN_TEST_EMAIL = "admin@uvote.com";
export const ADMIN_TEST_PASSWORD = "adminPassword123!";

/**
 * Creates a test admin user with predefined credentials
 * For development purposes only
 */
export const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const { data: existingUsers, error: checkError } = await supabase.auth.admin
      .listUsers({ page: 1, perPage: 10 })
      .catch(() => ({ data: null, error: null }));
    
    if (existingUsers?.users?.some(user => user.email === ADMIN_TEST_EMAIL)) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
      options: {
        data: {
          first_name: "Admin",
          last_name: "User",
        },
      },
    });

    if (error) {
      console.error("Error creating admin user:", error);
      return;
    }

    if (data.user) {
      // Assign admin role to the new user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: 'admin',
        } as any);

      if (roleError) {
        console.error("Error assigning admin role:", roleError);
      } else {
        console.log("Admin user created successfully!");
      }
    }
  } catch (error) {
    console.error("Error in admin user creation:", error);
  }
};

/**
 * Logs in with the test admin credentials
 */
export const loginAsAdmin = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_TEST_EMAIL,
      password: ADMIN_TEST_PASSWORD,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to login as admin. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Logged in as admin successfully.",
    });
    return true;
  } catch (error) {
    console.error("Error logging in as admin:", error);
    return false;
  }
};
