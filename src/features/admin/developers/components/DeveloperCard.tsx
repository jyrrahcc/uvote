
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { Developer } from "../types/developerTypes";

interface DeveloperCardProps {
  developer: Developer;
  onEdit: (developer: Developer) => void;
  onDelete: (developerId: string) => void;
}

const DeveloperCard = ({ developer, onEdit, onDelete }: DeveloperCardProps) => {
  return (
    <Card key={developer.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={developer.image_url || undefined} alt={developer.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {developer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">{developer.name}</h3>
                <Badge variant="secondary">{developer.role}</Badge>
                <Badge variant={developer.is_active ? "default" : "destructive"}>
                  {developer.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {developer.bio && (
                <p className="text-muted-foreground mb-2">{developer.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {developer.email && <span>📧 {developer.email}</span>}
                {developer.github_url && <span>🔗 GitHub</span>}
                {developer.linkedin_url && <span>🔗 LinkedIn</span>}
                {developer.twitter_url && <span>🔗 Twitter</span>}
                <span>📊 Order: {developer.display_order}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(developer)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Developer</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {developer.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(developer.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperCard;
