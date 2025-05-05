
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@/types";

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Card component to display a candidate
 */
const CandidateCard = ({ candidate, onClick, isSelected = false }: CandidateCardProps) => {
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-md ${
        isSelected ? "border-2 border-primary bg-secondary/50" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div>
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
    </Card>
  );
};

export default CandidateCard;
