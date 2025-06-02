
import {
  BarChart,
  FileText,
  Home,
  List,
  LucideIcon,
  User,
  Users,
  Vote,
  Code
} from "lucide-react";

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles: ("admin" | "voter" | "any")[];
  badge?: string;
}

export const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: Home, roles: ["admin", "voter", "any"] },
  { name: "Elections", path: "/elections", icon: Vote, roles: ["admin", "voter", "any"] },
  { name: "My Votes", path: "/my-votes", icon: FileText, roles: ["voter"] },
  { name: "My Applications", path: "/my-applications", icon: User, roles: ["voter"] },
  // Admin only pages
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
    name: "Manage Developers", 
    path: "/admin/developers", 
    icon: Code, 
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
  { name: "Profile", path: "/profile", icon: User, roles: ["admin", "voter", "any"] },
];
