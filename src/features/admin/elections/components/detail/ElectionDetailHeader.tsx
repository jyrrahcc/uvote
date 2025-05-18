
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Election } from "@/types";
import { 
  ArrowLeft, 
  Eye, 
  Pencil, 
  Check, 
  RefreshCcw
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ElectionForm from "@/components/admin/ElectionForm";

interface ElectionDetailHeaderProps {
  election: Election;
  navigate?: ReturnType<typeof useNavigate>;
  onCompleteElection?: () => Promise<void>;
  onResetVotes?: () => Promise<void>;
  onBackClick?: () => void;
}

const ElectionDetailHeader: React.FC<ElectionDetailHeaderProps> = ({
  election,
  navigate,
  onCompleteElection,
  onResetVotes,
  onBackClick
}) => {
  const defaultNavigate = useNavigate();
  const nav = navigate || defaultNavigate;
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    // Refresh the page to show updated election data
    window.location.reload();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBackClick || (() => nav('/admin/elections'))} 
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
          </Button>
          <Badge variant={election.status === 'active' ? 'default' : election.status === 'upcoming' ? 'outline' : 'secondary'} className="capitalize">
            {election.status}
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold">{election.title}</h1>
        {election.department && (
          <p className="text-muted-foreground mt-1">{election.department}</p>
        )}
        <p className="mt-4 max-w-3xl text-muted-foreground">{election.description}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline"
          onClick={() => nav(`/elections/${election.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Public Page
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Election
        </Button>
        
        {election.status !== "completed" && onCompleteElection && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Complete Election
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Election Early?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark the election "{election.title}" as completed before its scheduled end date.
                  No further votes will be accepted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={onCompleteElection}
                >
                  Complete Election
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {onResetVotes && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-amber-600">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset Votes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Election Votes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all votes for this election. 
                  All voters will be able to vote again. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-amber-600 text-white hover:bg-amber-700"
                  onClick={onResetVotes}
                >
                  Reset Votes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Edit Election Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Edit Election</DialogTitle>
            <DialogDescription>
              Modify the details for your election. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <ElectionForm
            editingElectionId={election.id}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectionDetailHeader;
