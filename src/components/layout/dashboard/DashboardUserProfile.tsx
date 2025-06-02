
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardUserProfileProps {
  collapsed: boolean;
}

const DashboardUserProfile = ({ collapsed }: DashboardUserProfileProps) => {
  const { user, signOut } = useAuth();
  const { userRole } = useRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name.charAt(0)}${user.user_metadata.last_name.charAt(0)}`;
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get full user name
  const getUserFullName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || "User";
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-2">
      <Separator className={cn("my-2", collapsed ? "hidden" : "block")} />
      <div className={cn("flex items-center gap-2 p-2 rounded-md", 
        collapsed ? "justify-center" : "")}>
        <Avatar className="h-8 w-8 border border-[#008f50]/20">
          <AvatarFallback className="bg-[#008f50]/10 text-[#008f50] text-xs">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn("flex flex-wrap flex-col overflow-hidden w-100", collapsed ? "hidden" : "block")}>
          <span className="text-sm font-medium truncate w-100">
            {getUserFullName()}
          </span>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
            {userRole ? `${userRole.charAt(0).toUpperCase()}${userRole.slice(1)}` : 'No Role'}
          </p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        className={cn(
          "flex items-center gap-2 w-full", 
          collapsed ? "justify-center p-2" : ""
        )}
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        <span className={cn(collapsed ? "hidden" : "block")}>Sign Out</span>
      </Button>
    </div>
  );
};

export default DashboardUserProfile;
