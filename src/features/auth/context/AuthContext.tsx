
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthState } from "../hooks/useAuthState";
import { authService } from "../services/authService";
import { AuthContextType } from "../types/authTypes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading, updateAuthState } = useAuthState();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    updateAuthState({ loading: true });
    
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    updateAuthState({ loading: true });
    
    try {
      const result = await authService.signUp(email, password, firstName, lastName);
      return result;
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signInWithGoogle = async () => {
    updateAuthState({ loading: true });
    try {
      await authService.signInWithGoogle();
      // Redirect happens in AuthContext after successful OAuth
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signInWithMicrosoft = async () => {
    updateAuthState({ loading: true });
    try {
      await authService.signInWithMicrosoft();
      // Redirect happens in AuthContext after successful OAuth
    } finally {
      updateAuthState({ loading: false });
    }
  };

  const signOut = async () => {
    updateAuthState({ loading: true });
    try {
      await authService.signOut();
      navigate("/login");
    } finally {
      updateAuthState({ loading: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithMicrosoft,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
