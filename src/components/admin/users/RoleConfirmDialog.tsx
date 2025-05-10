
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  UserCheck, 
  UserX, 
  ShieldCheck,
  ShieldX
} from "lucide-react";

interface RoleConfirmDialogProps {
  isOpen: boolean;
  userId: string;
  role: string;
  action: 'add' | 'remove';
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: (userId: string, role: "admin" | "voter", hasRole: boolean) => void;
}

const RoleConfirmDialog = ({
  isOpen,
  userId,
  role,
  action,
  isProcessing,
  onCancel,
  onConfirm
}: RoleConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'add' ? (
              <>
                {role === 'admin' ? (
                  <><ShieldCheck className="h-5 w-5 text-primary" /> Assign Admin Role</>
                ) : (
                  <><UserCheck className="h-5 w-5 text-primary" /> Assign Voter Role</>
                )}
              </>
            ) : (
              <>
                {role === 'admin' ? (
                  <><ShieldX className="h-5 w-5 text-destructive" /> Remove Admin Role</>
                ) : (
                  <><UserX className="h-5 w-5 text-destructive" /> Remove Voter Role</>
                )}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === 'add' ? (
              <>
                {role === 'admin' ? 
                  'This will give the user administrative privileges. They will be able to manage all aspects of the platform.' :
                  'This will allow the user to participate in elections.'
                }
              </>
            ) : (
              <>
                {role === 'admin' ? 
                  'This will remove administrative privileges from the user.' :
                  'This will prevent the user from participating in elections.'
                }
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'remove' ? "destructive" : "default"}
            onClick={() => onConfirm(userId, role as "admin" | "voter", action === 'remove')}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Processing...
              </>
            ) : (
              action === 'add' ? 'Assign Role' : 'Remove Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleConfirmDialog;
