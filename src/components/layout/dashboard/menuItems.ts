
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  History,
  Home,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
  Vote
} from "lucide-react";

export interface MenuItem {
  icon: any;
  label: string;
  to: string;
  isAdmin?: boolean;
}

export const menuItems: MenuItem[] = [
  { icon: Home, label: "Dashboard", to: "/dashboard" },
  { icon: Vote, label: "Elections", to: "/dashboard/elections" },
  { icon: MessageSquare, label: "Discussions", to: "/discussions" },
  { icon: History, label: "My Votes", to: "/my-votes" },
  { icon: FileText, label: "My Applications", to: "/my-applications" },
  { icon: UserCircle, label: "Profile", to: "/profile" },
  // Admin only pages
  { icon: Users, label: "Users", to: "/admin/users", isAdmin: true },
  { icon: FileSpreadsheet, label: "Manage Elections", to: "/admin/elections", isAdmin: true },
  { icon: BarChart3, label: "Analytics", to: "/admin/analytics", isAdmin: true },
  { icon: Settings, label: "Settings", to: "/admin/settings", isAdmin: true },
];
