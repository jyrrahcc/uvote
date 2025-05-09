
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Vote, 
  BarChart, 
  Shield, 
  Settings, 
  ArrowRight,
  University
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";

const AdminControls = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = useRole();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <University className="h-7 w-7 mr-2 text-[#008f50]" />
          <h2 className="text-2xl font-semibold">DLSU-D Admin Dashboard</h2>
        </div>
        <Badge variant="outline" className="bg-[#008f50]/10 text-[#008f50]">
          Admin Access
        </Badge>
      </div>
      
      <p className="text-muted-foreground">
        Welcome to the De La Salle University - Dasmariñas Election System admin dashboard. 
        As an administrator, you have access to manage elections, users, and view analytics for the entire voting system.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        <Card className="hover:shadow-md transition-shadow border-muted/60">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center text-lg">
                <Vote className="mr-2 h-5 w-5 text-[#008f50]" />
                Election Management
              </CardTitle>
              <Badge variant="outline" className="bg-[#008f50]/5">Admin</Badge>
            </div>
            <CardDescription>
              Create and manage campus elections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Create, edit, and manage elections for all colleges and departments. Monitor ongoing elections and view results.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/admin/elections")} 
              className="w-full justify-between bg-[#008f50] hover:bg-[#007a45]"
            >
              Manage Elections
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-muted/60">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5 text-[#008f50]" />
                User Management
              </CardTitle>
              <Badge variant="outline" className="bg-[#008f50]/5">Admin</Badge>
            </div>
            <CardDescription>
              Manage DLSU-D student accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Manage student accounts, assign roles, promote administrators, and monitor user activity across the campus.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/admin/users")} 
              className="w-full justify-between bg-[#008f50] hover:bg-[#007a45]"
            >
              Manage Users
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-muted/60">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="mr-2 h-5 w-5 text-[#008f50]" />
                Analytics Dashboard
              </CardTitle>
              <Badge variant="outline" className="bg-[#008f50]/5">Admin</Badge>
            </div>
            <CardDescription>
              Visualize election metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              View detailed analytics about elections, voter participation, and system usage patterns across all departments.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/admin/analytics")} 
              className="w-full justify-between bg-[#008f50] hover:bg-[#007a45]"
            >
              View Analytics
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-5 mt-4">
        <Card className="hover:shadow-md transition-shadow border-muted/60">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center text-lg">
                <Shield className="mr-2 h-5 w-5 text-[#008f50]" />
                System Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Configure system-wide settings, security options, and notification preferences for the DLSU-D election system.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => navigate("/admin/settings")} 
              className="w-full justify-between"
            >
              System Settings
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminControls;
