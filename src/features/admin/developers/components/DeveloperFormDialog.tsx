
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Developer } from "../types/developerTypes";
import { useDeveloperForm } from "../hooks/useDeveloperForm";
import DeveloperBasicInfoFields from "./form/DeveloperBasicInfoFields";
import DeveloperImageUploadSection from "./form/DeveloperImageUploadSection";
import DeveloperContactFields from "./form/DeveloperContactFields";
import DeveloperStatusToggle from "./form/DeveloperStatusToggle";
import DeveloperFormActions from "./form/DeveloperFormActions";

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
  const {
    form,
    setForm,
    isSubmitting,
    handleSubmit,
    handleImageUpload,
    handleImageUploadError,
    handleDialogClose,
  } = useDeveloperForm({ editingDeveloper, onSuccess, onOpenChange });

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDeveloper ? 'Edit Developer' : 'Add Developer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DeveloperBasicInfoFields 
            form={form} 
            setForm={setForm} 
            isSubmitting={isSubmitting} 
          />

          <DeveloperImageUploadSection
            form={form}
            setForm={setForm}
            isSubmitting={isSubmitting}
            onImageUpload={handleImageUpload}
            onImageUploadError={handleImageUploadError}
          />

          <DeveloperContactFields
            form={form}
            setForm={setForm}
            isSubmitting={isSubmitting}
          />

          <DeveloperStatusToggle
            form={form}
            setForm={setForm}
            isSubmitting={isSubmitting}
          />

          <DeveloperFormActions
            isSubmitting={isSubmitting}
            editingDeveloper={editingDeveloper}
            onCancel={handleDialogClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperFormDialog;
