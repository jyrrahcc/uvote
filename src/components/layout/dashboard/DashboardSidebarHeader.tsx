
import { Badge } from "@/components/ui/badge";
import { SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { useRole } from "@/features/auth/context/RoleContext";
import { cn } from "@/lib/utils";
import Logo from "../Logo";

interface DashboardSidebarHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const DashboardSidebarHeader = ({ collapsed, setCollapsed }: DashboardSidebarHeaderProps) => {
  const { isAdmin } = useRole();

  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center gap-2">
        <Logo size="small" showText={!collapsed} />
        <span className={cn("text-xs text-muted-foreground ml-auto", collapsed ? "hidden" : "block")}>
          {isAdmin && <Badge variant="outline" className="bg-[#008f50]/10 text-[#008f50]">Admin</Badge>}
        </span>
      </div>
      <div className="flex flex-col gap-1 md:hidden mt-2">
        <SidebarTrigger onClick={() => setCollapsed(!collapsed)} />
      </div>
    </SidebarHeader>
  );
};

export default DashboardSidebarHeader;
