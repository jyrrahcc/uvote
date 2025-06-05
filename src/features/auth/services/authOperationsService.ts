
import { authService } from "./authService";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const authOperationsService = {
  async handleSignIn(email: string, password: string) {
    try {
      const result = await authService.signIn(email, password);
      return result;
    } catch (error) {
      console.error("Sign in operation failed:", error);
      throw error;
    }
  },

  async handleSignUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    try {
      const result = await authService.signUp(email, password, firstName, lastName);
      return result;
    } catch (error) {
      console.error("Sign up operation failed:", error);
      throw error;
    }
  },

  async handleGoogleSignIn() {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error("Google sign in operation failed:", error);
      throw error;
    }
  },

  async handleMicrosoftSignIn() {
    try {
      await authService.signInWithMicrosoft();
    } catch (error) {
      console.error("Microsoft sign in operation failed:", error);
      throw error;
    }
  },

  async handleSignOut() {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Sign out operation failed:", error);
      throw error;
    }
  }
};
