
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Vote, BarChart, Shield } from "lucide-react";

const AdminControls = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-6">
      <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Vote className="mr-2 h-5 w-5 text-primary" />
              Election Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create, edit, and manage elections. Monitor ongoing elections and view results.
            </p>
            <Button 
              onClick={() => navigate("/admin/elections")} 
              className="w-full"
            >
              Manage Elections
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5 text-primary" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage user accounts, assign roles, and monitor user activity.
            </p>
            <Button 
              onClick={() => navigate("/admin/users")} 
              className="w-full"
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart className="mr-2 h-5 w-5 text-primary" />
              Analytics & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View detailed analytics and generate reports about elections and voter engagement.
            </p>
            <Button 
              onClick={() => navigate("/admin/analytics")} 
              className="w-full"
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminControls;
