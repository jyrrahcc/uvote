import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { Election } from '@/types';
import { formatDateRelative } from '@/utils/dateUtils';

interface ElectionCardProps {
  election: Election;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  
  const getActionButton = () => {
    switch (election.status) {
      case 'active':
        return (
          <Button className="w-full" asChild>
            <Link to={`/elections/${election.id}`}>Vote Now</Link>
          </Button>
        );
      case 'completed':
        return (
          <Button className="w-full" variant="outline" asChild>
            <Link to={`/elections/${election.id}/results`}>See Results</Link>
          </Button>
        );
      case 'upcoming':
      default:
        return (
          <Button className="w-full" variant="outline" disabled={true}>
            Vote (Coming Soon)
          </Button>
        );
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 truncate">{election.title}</h3>
        <p className="text-muted-foreground line-clamp-2 mb-4">{election.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {election.status === 'upcoming' && (
              <span>Starts {formatDateRelative(election.startDate)}</span>
            )}
            {election.status === 'active' && (
              <span>Ends {formatDateRelative(election.endDate)}</span>
            )}
            {election.status === 'completed' && (
              <span>Ended {formatDateRelative(election.endDate)}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${election.status === 'active' ? 'bg-green-100 text-green-800' :
                election.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}`
            }>
              {election.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
              {election.status === 'upcoming' && <Calendar className="h-3 w-3 mr-1" />}
              {election.status === 'completed' && <AlertCircle className="h-3 w-3 mr-1" />}
              {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
            </span>
            
            <Link to={`/elections/${election.id}/candidates`} className="inline-flex items-center text-xs text-primary hover:underline">
              <Users className="h-3 w-3 mr-1" />
              View Candidates
            </Link>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-muted/50">
        {getActionButton()}
      </CardFooter>
    </Card>
  );
};

export default ElectionCard;
