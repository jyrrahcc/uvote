
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DeveloperForm } from "../../types/developerTypes";

interface DeveloperContactFieldsProps {
  form: DeveloperForm;
  setForm: (form: DeveloperForm) => void;
  isSubmitting: boolean;
}

const DeveloperContactFields = ({ form, setForm, isSubmitting }: DeveloperContactFieldsProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="developer@example.com"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
            min="0"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            placeholder="https://github.com/username"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            value={form.linkedin_url}
            onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/username"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="twitter_url">Twitter URL</Label>
          <Input
            id="twitter_url"
            value={form.twitter_url}
            onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
            placeholder="https://twitter.com/username"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </>
  );
};

export default DeveloperContactFields;
