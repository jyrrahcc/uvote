
import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { useRole } from "@/features/auth/context/RoleContext";
import { cn } from "@/lib/utils";
import { Home, User, Vote } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems, MenuItem } from "./menuItems";

interface DashboardSidebarMenuProps {
  collapsed: boolean;
}

const DashboardSidebarMenu = ({ collapsed }: DashboardSidebarMenuProps) => {
  const { isAdmin, isVoter } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin && item.roles.includes("admin")) return true;
    if (isVoter && item.roles.includes("voter")) return true;
    if (item.roles.includes("any")) return true;
    return false;
  });

  // Fallback navigation items if role-based filtering returns empty
  const fallbackItems: MenuItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: Home, roles: ["any"] },
    { name: "Elections", path: "/elections", icon: Vote, roles: ["any"] },
    { name: "Profile", path: "/profile", icon: User, roles: ["any"] },
  ];

  const itemsToRender = filteredMenuItems.length > 0 ? filteredMenuItems : fallbackItems;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={cn(collapsed ? "sr-only" : "")}>
        Navigation
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {itemsToRender.map((item) => (
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
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default DashboardSidebarMenu;
