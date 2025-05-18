import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  BarChart,
  FileText,
  Home,
  List,
  LogOut,
  LucideIcon,
  Settings,
  User,
  Users,
  Vote
} from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MobileNav from "./MobileNav";
import Logo from "./Logo";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles: ("admin" | "voter" | "any")[];
  badge?: string;
}

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isVoter, userRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  // Define menu items with required roles
  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "voter", "any"] },
    { name: "Elections", path: "/elections", icon: Vote, roles: ["admin", "voter", "any"] },
    { name: "My Votes", path: "/my-votes", icon: FileText, roles: ["voter"] },
    { name: "My Applications", path: "/my-applications", icon: User, roles: ["voter"] },
    { 
      name: "Manage Elections", 
      path: "/admin/elections", 
      icon: List, 
      roles: ["admin"],
      badge: "Admin"
    },
    { 
      name: "Manage Users", 
      path: "/admin/users", 
      icon: Users, 
      roles: ["admin"],
      badge: "Admin"
    },
    { 
      name: "Analytics", 
      path: "/admin/analytics", 
      icon: BarChart, 
      roles: ["admin"],
      badge: "Admin"
    },
    { 
      name: "System Settings", 
      path: "/admin/settings", 
      icon: Settings, 
      roles: ["admin"],
      badge: "Admin"
    },
    { name: "Profile", path: "/profile", icon: User, roles: ["admin", "voter", "any"] },
  ];
  
  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin && item.roles.includes("admin")) return true;
    if (isVoter && item.roles.includes("voter")) return true;
    if (item.roles.includes("any")) return true; // Items that any authenticated user can access
    return false;
  });

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

  // Debug user role detection
  useEffect(() => {
    console.log("User role detection:", { 
      isAdmin, 
      isVoter, 
      userRole,
      filteredMenuItems: filteredMenuItems.map(item => item.name)
    });
  }, [isAdmin, isVoter, userRole, filteredMenuItems]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        {/* Mobile Navigation - Only visible on small screens */}
        <div className="fixed top-0 left-0 right-0 z-30">
          <MobileNav />
        </div>
        
        {/* Desktop Sidebar - Hidden on small screens */}
        <Sidebar className="border-r border-border bg-card hidden md:block">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Logo size={collapsed ? "small" : "medium"} />
              <span className={cn("text-xs text-muted-foreground ml-auto", collapsed ? "hidden" : "block")}>
                {isAdmin && <Badge variant="outline" className="bg-[#008f50]/10 text-[#008f50]">Admin</Badge>}
              </span>
            </div>
            <div className="flex flex-col gap-1 md:hidden mt-2">
              <SidebarTrigger onClick={() => setCollapsed(!collapsed)} />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-2">
            <SidebarGroup>
              <SidebarGroupLabel className={cn(collapsed ? "sr-only" : "")}>
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredMenuItems.length > 0 ? (
                    filteredMenuItems.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          className={cn(
                            "flex w-full justify-between",
                            location.pathname === item.path && "bg-[#008f50]/10 text-[#008f50] font-medium"
                          )}
                          asChild 
                          onClick={() => navigate(item.path)}
                        >
                          <button className="w-full">
                            <div className="flex items-center">
                              <item.icon className="h-4 w-4 mr-2" />
                              <span className={cn(collapsed ? "hidden" : "block")}>{item.name}</span>
                            </div>
                            {item.badge && !collapsed && (
                              <Badge variant="outline" className="ml-auto text-xs bg-[#008f50]/5 text-[#008f50]/80">
                                {item.badge}
                              </Badge>
                            )}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    // Fallback navigation items if role-based filtering returns empty
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={cn(
                            "flex w-full justify-between",
                            location.pathname === "/dashboard" && "bg-[#008f50]/10 text-[#008f50] font-medium"
                          )}
                          asChild 
                          onClick={() => navigate("/dashboard")}
                        >
                          <button className="w-full">
                            <div className="flex items-center">
                              <Home className="h-4 w-4 mr-2" />
                              <span className={cn(collapsed ? "hidden" : "block")}>Dashboard</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={cn(
                            "flex w-full justify-between",
                            location.pathname === "/elections" && "bg-[#008f50]/10 text-[#008f50] font-medium"
                          )}
                          asChild 
                          onClick={() => navigate("/elections")}
                        >
                          <button className="w-full">
                            <div className="flex items-center">
                              <Vote className="h-4 w-4 mr-2" />
                              <span className={cn(collapsed ? "hidden" : "block")}>Elections</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={cn(
                            "flex w-full justify-between",
                            location.pathname === "/profile" && "bg-[#008f50]/10 text-[#008f50] font-medium"
                          )}
                          asChild 
                          onClick={() => navigate("/profile")}
                        >
                          <button className="w-full">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span className={cn(collapsed ? "hidden" : "block")}>Profile</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4">
            {user && (
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
            )}
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-6 flex-1 overflow-auto md:pt-6 pt-20">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
