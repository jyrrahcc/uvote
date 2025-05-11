import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RoleProtectedRouteProps {
  requiredRole: "admin" | "voter";
  redirectTo?: string;
  showMessage?: boolean;
}

export const RoleProtectedRoute = ({ 
  requiredRole,
  redirectTo = "/", 
  showMessage = true
}: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: roleLoading, checkRole } = useRole();
  const [accessChecked, setAccessChecked] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  
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
      
      // Show access denied message if configured, but only once
      if (!hasPermission && user && showMessage && !toastShown) {
        setToastShown(true); // Prevent showing toast multiple times
        
        if (requiredRole === "voter") {
          toast.error("You need to verify your profile to access this feature", {
            description: "Please complete your profile information and verify it first.",
            id: "voter-access-required" // Add ID to prevent duplicate toasts
          });
        } else if (requiredRole === "admin") {
          toast.error("Administrative privileges required", {
            description: "You don't have permission to access this area.",
            id: "admin-access-required" // Add ID to prevent duplicate toasts
          });
        }
      }
    }
  }, [user, authLoading, roleLoading, hasPermission, requiredRole, showMessage, toastShown]);
  
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
