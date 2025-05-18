import React from 'react';
import { CalendarDays, Clock, Flag, ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Election } from "@/types";

interface ElectionDetailsHeaderProps {
  election: Election;
}

const ElectionDetailsHeader = ({ election }: ElectionDetailsHeaderProps) => {
  const bannerUrls = election?.bannerUrls || [];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {bannerUrls.length > 0 && (
        <div className="relative w-full h-48 overflow-hidden rounded-md mb-4">
          <img
            src={bannerUrls[0]}
            alt="Election Banner"
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      <h2 className="text-2xl font-semibold mb-2">{election.title}</h2>
      <p className="text-gray-600 mb-4">{election.description}</p>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <CalendarDays className="h-5 w-5" />
          <span>
            {format(parseISO(election.startDate), 'PPP')} - {format(parseISO(election.endDate), 'PPP')}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="h-5 w-5" />
          <span>
            {format(parseISO(election.startDate), 'h:mm a')} - {format(parseISO(election.endDate), 'h:mm a')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Flag className="h-5 w-5" />
          <span>
            Candidacy Period: {format(parseISO(election.candidacyStartDate), 'PPP')} - {format(parseISO(election.candidacyEndDate), 'PPP')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        {election.isPrivate ? (
          <Badge variant="secondary">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Private Election
          </Badge>
        ) : (
          <Badge>Public Election</Badge>
        )}
      </div>
    </div>
  );
};

export default ElectionDetailsHeader;
