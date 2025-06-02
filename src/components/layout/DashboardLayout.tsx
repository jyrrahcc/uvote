
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarProvider
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileNav from "./MobileNav";
import DashboardSidebarHeader from "./dashboard/DashboardSidebarHeader";
import DashboardSidebarMenu from "./dashboard/DashboardSidebarMenu";
import DashboardUserProfile from "./dashboard/DashboardUserProfile";

const DashboardLayout = () => {
  const { user } = useAuth();
  const { isAdmin, isVoter, userRole } = useRole();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Debug user role detection
  useEffect(() => {
    console.log("User role detection:", { 
      isAdmin, 
      isVoter, 
      userRole
    });
  }, [isAdmin, isVoter, userRole]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        {/* Mobile Navigation - Only visible on small screens */}
        <div className="fixed top-0 left-0 right-0 z-30">
          <MobileNav />
        </div>
        
        {/* Desktop Sidebar - Hidden on small screens */}
        <Sidebar className="border-r border-border bg-card hidden md:block">
          <DashboardSidebarHeader 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
          />
          
          <SidebarContent className="px-3 py-2">
            <DashboardSidebarMenu collapsed={collapsed} />
          </SidebarContent>
          
          <SidebarFooter className="p-4">
            <DashboardUserProfile collapsed={collapsed} />
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
