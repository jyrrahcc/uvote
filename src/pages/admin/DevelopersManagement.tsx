
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRole } from "@/features/auth/context/RoleContext";
import DevelopersManagementHeader from "@/features/admin/developers/components/DevelopersManagementHeader";
import DeveloperFormDialog from "@/features/admin/developers/components/DeveloperFormDialog";
import DeveloperCard from "@/features/admin/developers/components/DeveloperCard";
import EmptyDevelopersList from "@/features/admin/developers/components/EmptyDevelopersList";
import { useDevelopers } from "@/features/admin/developers/hooks/useDevelopers";
import { Developer } from "@/features/admin/developers/types/developerTypes";

const DevelopersManagement = () => {
  const { isAdmin } = useRole();
  const { developers, loading, fetchDevelopers, handleDelete } = useDevelopers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper(developer);
    setIsDialogOpen(true);
  };

  const handleAddDeveloper = () => {
    setEditingDeveloper(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setEditingDeveloper(null);
    fetchDevelopers();
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DevelopersManagementHeader onAddDeveloper={handleAddDeveloper} />

      <DeveloperFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingDeveloper={editingDeveloper}
        onSuccess={handleSuccess}
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading developers...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {developers.length === 0 ? (
            <EmptyDevelopersList onAddDeveloper={handleAddDeveloper} />
          ) : (
            developers.map((developer) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DevelopersManagement;
