
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  History,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
  Vote
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  isAdmin?: boolean;
}

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems: SidebarItem[] = [
    { icon: <Home size={20} />, label: "Dashboard", to: "/dashboard" },
    { icon: <Vote size={20} />, label: "Elections", to: "/elections" },
    { icon: <MessageSquare size={20} />, label: "Discussions", to: "/discussions" },
    { icon: <History size={20} />, label: "My Votes", to: "/my-votes" },
    { icon: <FileText size={20} />, label: "My Applications", to: "/my-applications" },
    { icon: <UserCircle size={20} />, label: "Profile", to: "/profile" },
    // Admin only pages
    { icon: <Users size={20} />, label: "Users", to: "/admin/users", isAdmin: true },
    { icon: <FileSpreadsheet size={20} />, label: "Manage Elections", to: "/admin/elections", isAdmin: true },
    { icon: <BarChart3 size={20} />, label: "Analytics", to: "/admin/analytics", isAdmin: true },
    { icon: <Settings size={20} />, label: "Settings", to: "/admin/settings", isAdmin: true },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div
      className={cn(
        "min-h-screen border-r px-2 py-6 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-[70px]"
      )}
    >
      <div className="flex items-center justify-center mb-8">
        <Logo size={isSidebarOpen ? "medium" : "small"} showText={isSidebarOpen} />
      </div>

      <div className="flex flex-col space-y-1">
        {navItems
          .filter((item) => !item.isAdmin || isAdmin)
          .map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={isActive(item.to) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.to) ? "bg-green-100 hover:bg-green-200 text-green-800" : ""
                )}
              >
                {item.icon}
                {isSidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            </Link>
          ))}
      </div>

      <div className="absolute bottom-6 left-0 right-0 px-2">
        <Button
          variant="ghost"
          onClick={() => signOut()}
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} />
          {isSidebarOpen && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
