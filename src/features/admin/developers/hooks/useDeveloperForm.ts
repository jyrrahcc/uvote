
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Developer, DeveloperForm, initialForm } from "../types/developerTypes";

interface UseDeveloperFormProps {
  editingDeveloper: Developer | null;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useDeveloperForm = ({ editingDeveloper, onSuccess, onOpenChange }: UseDeveloperFormProps) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required');
      return;
    }

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setForm({ ...form, image_url: url });
    toast.success('Profile image uploaded successfully');
  };

  const handleImageUploadError = (error: string) => {
    console.error('Image upload error:', error);
    toast.error('Failed to upload image: ' + error);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    onOpenChange(false);
    setForm(initialForm);
  };

  return {
    form,
    setForm,
    isSubmitting,
    handleSubmit,
    handleImageUpload,
    handleImageUploadError,
    handleDialogClose,
  };
};
