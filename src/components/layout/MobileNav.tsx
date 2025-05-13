
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
  CalendarDays, 
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

  return (
    <div className="md:hidden sticky top-0 z-40 w-full bg-background border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <Logo size="small" />
        
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh] rounded-t-xl">
            <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-muted" />
            
            <div className="p-4 flex flex-col h-full">
              {/* User info */}
              <div className="flex items-center gap-3 mb-4 p-2 border-b pb-4">
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
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
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col space-y-1">
                  {filteredNavItems.map((item) => (
                    <DrawerClose asChild key={item.to}>
                      <Link to={item.to}>
                        <Button
                          variant={isActive(item.to) ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start rounded-lg",
                            isActive(item.to) 
                              ? "bg-primary/10 text-primary hover:bg-primary/20 font-medium" 
                              : "text-foreground/80 hover:text-foreground"
                          )}
                        >
                          <span className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </span>
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
                className="mt-4 w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={20} />
                <span className="ml-3">Logout</span>
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Current page indicator */}
      <div className="bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
        {filteredNavItems.find(item => isActive(item.to))?.label || "uVote"}
      </div>
    </div>
  );
};

export default MobileNav;
