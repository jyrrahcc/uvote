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
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "./menuItems";

interface DashboardSidebarMenuProps {
  collapsed: boolean;
}

const DashboardSidebarMenu = ({ collapsed }: DashboardSidebarMenuProps) => {
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    // If item has isAdmin flag and user is not admin, exclude it
    if (item.isAdmin && !isAdmin) return false;
    // Otherwise include the item
    return true;
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={cn(collapsed ? "sr-only" : "")}>
        Navigation
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton 
                className={cn(
                  "flex w-full justify-between",
                  location.pathname === item.to && "bg-[#008f50]/10 text-[#008f50] font-medium"
                )}
                asChild 
                onClick={() => navigate(item.to)}
              >
                <button className="w-full">
                  <div className="flex items-center">
                    <item.icon className="h-4 w-4 mr-2" />
                    <span className={cn(collapsed ? "hidden" : "block")}>{item.label}</span>
                  </div>
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
