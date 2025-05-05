
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
import { User, LogOut, Home, Vote, Users, Settings, FileText, List } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";

interface MenuItem {
  name: string;
  path: string;
  icon: typeof Home;
  roles: ("admin" | "voter")[];
}

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isVoter } = useRole();
  const navigate = useNavigate();
  
  // Define menu items with required roles
  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "voter"] },
    { name: "Elections", path: "/elections", icon: Vote, roles: ["admin", "voter"] },
    { name: "My Votes", path: "/my-votes", icon: FileText, roles: ["voter"] },
    { name: "Candidates", path: "/candidates", icon: Users, roles: ["admin", "voter"] },
    { name: "Manage Elections", path: "/admin/elections", icon: List, roles: ["admin"] },
    { name: "Manage Users", path: "/admin/users", icon: Users, roles: ["admin"] },
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

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-xl">u</span>
              <span className="text-2xl font-bold">Vote</span>
            </div>
            <div className="flex flex-col gap-1">
              <SidebarTrigger className="md:hidden self-end" />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        onClick={() => navigate(item.path)}
                      >
                        <button>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
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
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <User className="h-4 w-4" />
                  <span className="text-sm truncate">
                    {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 md:p-8 flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
