
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { CandidateApplication, fetchUserCandidateApplications, deleteCandidateApplication } from "../services/candidateApplicationService";
import ApplicationStatusBadge from "../components/ApplicationStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadMyApplications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await fetchUserCandidateApplications(user.id);
      setApplications(data);
    } catch (error) {
      console.error("Error loading my applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyApplications();
  }, [user]);

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      await deleteCandidateApplication(applicationId);
      // Refresh the applications list
      loadMyApplications();
    } catch (error) {
      console.error("Error withdrawing application:", error);
    }
  };

  const handleViewElection = (electionId: string) => {
    navigate(`/elections/${electionId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6" />
            My Candidate Applications
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your candidate applications for elections
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/elections")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Elections
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-md"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't submitted any candidate applications yet.</p>
            <Button onClick={() => navigate("/elections")}>
              Browse Elections
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map(application => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{application.name}</CardTitle>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <CardDescription>
                  Position: {application.position}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">{application.bio}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {application.feedback && (
                    <div>
                      <p className="text-sm font-medium">Admin Feedback:</p>
                      <p className="text-sm text-muted-foreground">{application.feedback}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewElection(application.electionId)}
                    >
                      View Election
                    </Button>
                    
                    {application.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            Withdraw Application
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to withdraw your candidate application? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleWithdrawApplication(application.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Withdraw
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
