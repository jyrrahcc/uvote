
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { useEffect, useState } from "react";

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
  const [accessChecked, setAccessChecked] = useState(false);
  
  const hasPermission = checkRole(requiredRole);
  const loading = authLoading || roleLoading;
  
  // Log the permission check
  useEffect(() => {
    console.log("RoleProtectedRoute check:", {
      requiredRole,
      user: !!user,
      authLoading,
      roleLoading,
      hasPermission
    });
    
    if (!loading) {
      setAccessChecked(true);
    }
  }, [user, authLoading, roleLoading, hasPermission, requiredRole]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
          <p className="text-sm text-muted-foreground mt-2">Checking permissions</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  if (!hasPermission && accessChecked) {
    console.log("User doesn't have required role, redirecting");
    return <Navigate to={redirectTo} />;
  }
  
  console.log("Access granted to role-protected route");
  return <Outlet />;
};
