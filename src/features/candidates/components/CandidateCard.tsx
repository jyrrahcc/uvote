
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    position: string;
    bio?: string;
    image_url?: string;
    election_id: string;
  };
}

export const CandidateCard = ({ candidate }: CandidateCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{candidate.name}</CardTitle>
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
