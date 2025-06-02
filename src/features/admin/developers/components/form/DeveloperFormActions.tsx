
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface DeveloperFormActionsProps {
  isSubmitting: boolean;
  editingDeveloper: any;
  onCancel: () => void;
}

const DeveloperFormActions = ({ isSubmitting, editingDeveloper, onCancel }: DeveloperFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Saving...' : (editingDeveloper ? 'Update' : 'Create')}
      </Button>
    </div>
  );
};

export default DeveloperFormActions;
