
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    position: string;
    bio?: string;
    image_url?: string;
    election_id: string;
  };
  onClick?: () => void;
  onDelete?: () => void;
}

export const CandidateCard = ({ candidate, onClick, onDelete }: CandidateCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{candidate.name}</CardTitle>
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
        <CardDescription>
          {candidate.position}
        </CardDescription>
        {candidate.image_url && (
          <div className="mt-3 w-full h-40 relative">
            <img 
              src={candidate.image_url} 
              alt={`${candidate.name}`} 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {candidate.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{candidate.bio}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateCard;
