
import { useRole } from "@/features/auth/context/RoleContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AdminControls from "@/components/dashboard/AdminControls";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Vote } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { isAdmin, userRole } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <WelcomeHeader />
      
      <div className="grid gap-6">
        <DashboardStats />
        
        {!isAdmin && (
          <div className="grid md:grid-cols-2 gap-6 mt-2">
            <Card className="border-muted/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Vote className="mr-2 h-5 w-5 text-primary" />
                  Cast Your Vote
                </CardTitle>
                <CardDescription>
                  Participate in active elections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browse active elections and make your voice heard. Your vote matters!
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/elections')} className="w-full sm:w-auto">
                  View Elections
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-muted/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  My Voting History
                </CardTitle>
                <CardDescription>
                  View your past votes and election results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your participation in previous elections and review the results.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/my-votes')} 
                  className="w-full sm:w-auto"
                >
                  View History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {isAdmin && <AdminControls />}
      </div>
    </div>
  );
};

export default Dashboard;
