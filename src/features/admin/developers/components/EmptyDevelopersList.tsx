
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface EmptyDevelopersListProps {
  onAddDeveloper: () => void;
}

const EmptyDevelopersList = ({ onAddDeveloper }: EmptyDevelopersListProps) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No developers found</h3>
        <p className="text-muted-foreground mb-4">Start by adding your first team member.</p>
        <Button onClick={onAddDeveloper}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Developer
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyDevelopersList;
