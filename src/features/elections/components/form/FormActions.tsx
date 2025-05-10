
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  editingElectionId: string | null;
  onCancel: () => void;
}

const FormActions = ({ isSubmitting, editingElectionId, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-[#008f50] hover:bg-[#007a45]"
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
            {editingElectionId ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>{editingElectionId ? "Update Election" : "Create Election"}</>
        )}
      </Button>
    </div>
  );
};

export default FormActions;
