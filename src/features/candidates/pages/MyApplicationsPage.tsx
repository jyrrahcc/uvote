
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Trash } from "lucide-react";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import ApplicationStatusBadge from "../components/ApplicationStatusBadge";
import { useUserCandidateApplications } from "../hooks/useCandidateApplications";
import { deleteCandidateApplication } from "../services/candidateApplicationService";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const MyApplicationsPage = () => {
  const { applications, loading, error, refetch } = useUserCandidateApplications();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null);
  
  const confirmWithdraw = (applicationId: string) => {
    setApplicationToWithdraw(applicationId);
    setConfirmDialogOpen(true);
  };
  
  const handleWithdraw = async () => {
    if (!applicationToWithdraw) return;
    
    try {
      setDeletingId(applicationToWithdraw);
      await deleteCandidateApplication(applicationToWithdraw);
      toast.success("Application withdrawn successfully");
      refetch();
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application");
    } finally {
      setDeletingId(null);
      setConfirmDialogOpen(false);
      setApplicationToWithdraw(null);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        <div className="text-center py-12 border rounded-md">
          <p className="text-destructive mb-4">Failed to load your applications.</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      
      {applications.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl mb-2">No applications found</p>
          <p className="text-muted-foreground mb-6">
            You haven't applied to be a candidate in any elections yet.
          </p>
          <Link to="/elections">
            <Button>Browse Elections</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{application.name}</CardTitle>
                  <ApplicationStatusBadge status={application.status as 'pending' | 'approved' | 'rejected'} />
                </div>
                <CardDescription>
                  Position: {application.position}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow">
                {application.bio && (
                  <div className="mb-4">
                    <p className="font-medium text-sm">Bio:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                      {application.bio}
                    </p>
                  </div>
                )}
                
                {application.feedback && (
                  <div className="mb-4">
                    <p className="font-medium text-sm">Feedback:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                      {application.feedback}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-4">
                  Submitted on {formatDate(application.created_at || '')}
                </p>
              </CardContent>
              
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  <Link to={`/elections/${application.election_id}`}>
                    <Button variant="outline" size="sm">
                      View Election
                    </Button>
                  </Link>
                  
                  {application.status === "pending" && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => confirmWithdraw(application.id)}
                      disabled={deletingId === application.id}
                    >
                      {deletingId === application.id ? (
                        <span className="animate-spin mr-1">...</span>
                      ) : (
                        <Trash className="h-4 w-4 mr-1" />
                      )}
                      Withdraw
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw your application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWithdraw}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId ? "Withdrawing..." : "Withdraw Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyApplicationsPage;
