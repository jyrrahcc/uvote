
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  redirectTo = "/login" 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? <Outlet /> : <Navigate to={redirectTo} />;
};

export const PublicOnlyRoute = ({ 
  redirectTo = "/dashboard" 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return !user ? <Outlet /> : <Navigate to={redirectTo} />;
};
