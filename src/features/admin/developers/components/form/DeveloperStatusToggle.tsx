
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DeveloperForm } from "../../types/developerTypes";

interface DeveloperStatusToggleProps {
  form: DeveloperForm;
  setForm: (form: DeveloperForm) => void;
  isSubmitting: boolean;
}

const DeveloperStatusToggle = ({ form, setForm, isSubmitting }: DeveloperStatusToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="is_active"
        checked={form.is_active}
        onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
        disabled={isSubmitting}
      />
      <Label htmlFor="is_active">Active (visible on About page)</Label>
    </div>
  );
};

export default DeveloperStatusToggle;
