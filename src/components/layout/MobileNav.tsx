
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRole } from "@/features/auth/context/RoleContext";
import { 
  BarChart3, 
  FileText, 
  Home, 
  Settings,
  Users,
  Vote,
  LogOut,
  UserCircle,
  History,
  FileSpreadsheet
} from "lucide-react";
import Logo from "./Logo";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  isAdmin?: boolean;
}

const MobileNav = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const location = useLocation();

  const navItems: SidebarItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", to: "/dashboard" },
    { icon: <Vote size={20} />, label: "Elections", to: "/elections" },
    { icon: <History size={20} />, label: "My Votes", to: "/my-votes" },
    { icon: <FileText size={20} />, label: "My Applications", to: "/my-applications" },
    { icon: <UserCircle size={20} />, label: "Profile", to: "/profile" },
    // Admin only pages
    { icon: <Users size={20} />, label: "Users", to: "/admin/users", isAdmin: true },
    { icon: <FileSpreadsheet size={20} />, label: "Manage Elections", to: "/admin/elections", isAdmin: true },
    { icon: <BarChart3 size={20} />, label: "Analytics", to: "/admin/analytics", isAdmin: true },
    { icon: <Settings size={20} />, label: "System Settings", to: "/admin/settings", isAdmin: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.isAdmin || isAdmin
  );

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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get current page name for display
  const getCurrentPageName = () => {
    const currentItem = filteredNavItems.find(item => isActive(item.to));
    return currentItem?.label || "Dashboard";
  };

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <Logo size="small" />
      
      <div className="flex-1 text-center font-medium">
        {getCurrentPageName()}
      </div>
      
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[80vh]">
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
          
          <div className="p-4 flex flex-col h-full">
            {/* User info */}
            <div className="flex items-center gap-3 mb-6 p-2">
              <Avatar className="h-10 w-10 border border-[#008f50]/20">
                <AvatarFallback className="bg-[#008f50]/10 text-[#008f50]">
                  {getUserInitials()}
                </AvatarFallback>
                {user?.user_metadata?.avatar_url && (
                  <AvatarImage src={user.user_metadata.avatar_url} />
                )}
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user?.user_metadata?.first_name 
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
                    : user?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Administrator" : "Voter"}
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex-1">
              <nav className="flex flex-col space-y-1">
                {filteredNavItems.map((item) => (
                  <DrawerClose asChild key={item.to}>
                    <Link to={item.to}>
                      <Button
                        variant={isActive(item.to) ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive(item.to) ? "bg-green-100 hover:bg-green-200 text-green-800" : ""
                        )}
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Button>
                    </Link>
                  </DrawerClose>
                ))}
              </nav>
            </div>
            
            {/* Logout button */}
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="mt-4 w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNav;
