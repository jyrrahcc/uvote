
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { UploadButton } from "@/components/ui/upload-button";
import { supabase } from "@/integrations/supabase/client";
import { Developer, DeveloperForm, initialForm } from "../types/developerTypes";

interface DeveloperFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingDeveloper: Developer | null;
  onSuccess: () => void;
}

const DeveloperFormDialog = ({ 
  isOpen, 
  onOpenChange, 
  editingDeveloper, 
  onSuccess 
}: DeveloperFormDialogProps) => {
  const { user } = useAuth();
  const [form, setForm] = useState<DeveloperForm>(
    editingDeveloper ? {
      name: editingDeveloper.name,
      role: editingDeveloper.role,
      bio: editingDeveloper.bio || '',
      image_url: editingDeveloper.image_url || '',
      github_url: editingDeveloper.github_url || '',
      linkedin_url: editingDeveloper.linkedin_url || '',
      twitter_url: editingDeveloper.twitter_url || '',
      email: editingDeveloper.email || '',
      display_order: editingDeveloper.display_order,
      is_active: editingDeveloper.is_active,
    } : initialForm
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required');
      return;
    }

    try {
      const developerData = {
        ...form,
        created_by: user?.id,
      };

      let result;
      if (editingDeveloper) {
        result = await supabase
          .from('developers')
          .update(developerData)
          .eq('id', editingDeveloper.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('developers')
          .insert([developerData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving developer:', result.error);
        toast.error('Failed to save developer');
        return;
      }

      toast.success(editingDeveloper ? 'Developer updated successfully' : 'Developer added successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving developer:', error);
      toast.error('Failed to save developer');
    }
  };

  const handleImageUpload = (url: string) => {
    setForm({ ...form, image_url: url });
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setForm(initialForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDeveloper ? 'Edit Developer' : 'Add Developer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
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
            />
          </div>

          <div>
            <Label>Profile Image</Label>
            <div className="space-y-4">
              {form.image_url && (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={form.image_url} alt="Preview" />
                    <AvatarFallback>Preview</AvatarFallback>
                  </Avatar>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setForm({ ...form, image_url: '' })}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
              <UploadButton
                bucketName="developers"
                folderPath="profile-images"
                onUploadComplete={handleImageUpload}
                accept="image/*"
                maxSizeMB={2}
                buttonText="Upload Profile Image"
                variant="outline"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="developer@example.com"
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
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                value={form.twitter_url}
                onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            />
            <Label htmlFor="is_active">Active (visible on About page)</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {editingDeveloper ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperFormDialog;
