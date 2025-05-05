
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  LogOut, 
  Home, 
  Vote, 
  Users, 
  Settings, 
  FileText, 
  List, 
  ShieldCheck, 
  BarChart, 
  LucideIcon 
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles: ("admin" | "voter")[];
  badge?: string;
}

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isVoter, userRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Define menu items with required roles
  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "voter"] },
    { name: "Elections", path: "/elections", icon: Vote, roles: ["admin", "voter"] },
    { name: "My Votes", path: "/my-votes", icon: FileText, roles: ["voter"] },
    { name: "Candidates", path: "/candidates", icon: Users, roles: ["admin", "voter"] },
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
    { name: "Settings", path: "/profile", icon: Settings, roles: ["admin", "voter"] },
  ];
  
  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (item.roles.includes("admin") && isAdmin) return true;
    if (item.roles.includes("voter") && isVoter) return true;
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

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Vote className="h-6 w-6 text-primary" />
              <span className={cn("font-bold text-xl", collapsed ? "hidden" : "block")}>uVote</span>
              <span className={cn("text-xs text-muted-foreground ml-auto", collapsed ? "hidden" : "block")}>
                {isAdmin && <Badge variant="outline" className="bg-primary/10 text-primary">Admin</Badge>}
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
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        className={cn(
                          "flex w-full justify-between",
                          location.pathname === item.path && "bg-primary/10 text-primary font-medium"
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
                            <Badge variant="outline" className="ml-auto text-xs bg-primary/5 text-primary/80">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn("flex flex-col", collapsed ? "hidden" : "block")}>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {getUserFullName()}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {userRole && `${userRole.charAt(0).toUpperCase()}${userRole.slice(1)}`}
                    </span>
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
          <div className="p-6 flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
