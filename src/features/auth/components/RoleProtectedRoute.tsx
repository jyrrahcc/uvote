
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

interface RoleProtectedRouteProps {
  requiredRole: "admin" | "voter";
  redirectTo?: string;
}

export const RoleProtectedRoute = ({ 
  requiredRole,
  redirectTo = "/" 
}: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: roleLoading, checkRole } = useRole();
  
  const hasPermission = checkRole(requiredRole);
  const loading = authLoading || roleLoading;
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return hasPermission ? <Outlet /> : <Navigate to={redirectTo} />;
};
