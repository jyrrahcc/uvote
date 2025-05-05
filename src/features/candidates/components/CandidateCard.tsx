
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Candidate } from "@/types";

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  isSelected?: boolean;
  onDelete?: () => void;
}

/**
 * Card component to display a candidate
 */
const CandidateCard = ({ 
  candidate, 
  onClick, 
  isSelected = false, 
  onDelete 
}: CandidateCardProps) => {
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card 
      className={`transition-all hover:shadow-md ${
        isSelected ? "border-2 border-primary bg-secondary/50" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">{candidate.name}</h3>
          <Badge variant="outline" className="mt-1">
            {candidate.position}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {candidate.bio}
        </p>
      </CardContent>
      {onDelete && (
        <CardFooter className="pt-0 justify-end">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateCard;
