
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface DevelopersManagementHeaderProps {
  onAddDeveloper: () => void;
}

const DevelopersManagementHeader = ({ onAddDeveloper }: DevelopersManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Developers Management</h1>
        <p className="text-muted-foreground mt-2">Manage the team members displayed on the About Us page</p>
      </div>
      <Button onClick={onAddDeveloper}>
        <Plus className="h-4 w-4 mr-2" />
        Add Developer
      </Button>
    </div>
  );
};

export default DevelopersManagementHeader;
