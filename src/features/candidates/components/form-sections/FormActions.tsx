
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  loading: boolean;
  onClose: () => void;
}

const FormActions = ({ loading, onClose }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Registration"}
      </Button>
    </div>
  );
};

export default FormActions;
