
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeveloperForm } from "../../types/developerTypes";

interface DeveloperBasicInfoFieldsProps {
  form: DeveloperForm;
  setForm: (form: DeveloperForm) => void;
  isSubmitting: boolean;
}

const DeveloperBasicInfoFields = ({ form, setForm, isSubmitting }: DeveloperBasicInfoFieldsProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="e.g., Lead Developer, UI/UX Designer"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Brief description about the developer..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};

export default DeveloperBasicInfoFields;
