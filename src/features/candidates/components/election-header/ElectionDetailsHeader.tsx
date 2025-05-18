import React from 'react';
import { CalendarDays, Clock, Flag, ShieldCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Election } from '@/types';

interface ElectionDetailsHeaderProps {
  election: Election | null;
}

const ElectionDetailsHeader = ({ election }: ElectionDetailsHeaderProps) => {
  if (!election) {
    return <p>No election details available.</p>;
  }

  const bannerUrls = election?.bannerUrls || [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {bannerUrls.length > 0 && (
        <div className="relative h-64">
          <img
            src={bannerUrls[0]}
            alt="Election Banner"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
            {election.title}
          </div>
        </div>
      )}

      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{election.title}</h2>
        <p className="text-gray-600 mb-5">{election.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <div className="flex items-center text-gray-500">
              <CalendarDays className="mr-2 h-5 w-5" />
              <span>
                {format(parseISO(election.startDate), 'PPP')} - {format(parseISO(election.endDate), 'PPP')}
              </span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="mr-2 h-5 w-5" />
              <span>
                {format(parseISO(election.startDate), 'h:mm a')} - {format(parseISO(election.endDate), 'h:mm a')}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center text-gray-500">
              <Flag className="mr-2 h-5 w-5" />
              <span>Candidacy Period: {format(parseISO(election.candidacyStartDate), 'PPP')} - {format(parseISO(election.candidacyEndDate), 'PPP')}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <ShieldCheck className="mr-2 h-5 w-5" />
              <span>Status: <Badge variant="secondary">{election.status}</Badge></span>
            </div>
          </div>
        </div>

        {election.department && (
          <div className="mb-4">
            <span className="text-gray-700 font-medium">Department:</span>
            <span className="text-gray-500 ml-2">{election.department}</span>
          </div>
        )}

        {election.colleges && election.colleges.length > 0 && (
          <div className="mb-4">
            <span className="text-gray-700 font-medium">Colleges:</span>
            <span className="text-gray-500 ml-2">{election.colleges.join(', ')}</span>
          </div>
        )}

        {election.eligibleYearLevels && election.eligibleYearLevels.length > 0 && (
          <div>
            <span className="text-gray-700 font-medium">Eligible Year Levels:</span>
            <span className="text-gray-500 ml-2">{election.eligibleYearLevels.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionDetailsHeader;
