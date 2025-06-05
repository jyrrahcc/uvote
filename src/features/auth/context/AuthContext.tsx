
import { createContext, useContext } from "react";
import { useAuthState } from "../hooks/useAuthState";
import { useAuthOperations } from "../hooks/useAuthOperations";
import { AuthContextType } from "../types/authTypes";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading, updateAuthState } = useAuthState();
  
  const authOperations = useAuthOperations({ updateAuthState });

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        ...authOperations,
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
