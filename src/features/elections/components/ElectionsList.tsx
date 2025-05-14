import React from "react";
import { Election } from "@/types";

interface ElectionsListProps {
  elections: Election[];
}

const dummyElections: Election[] = [
  {
    id: "1",
    title: "Student Council Elections",
    description: "Vote for your student council representatives",
    startDate: "2023-05-01T00:00:00Z",
    endDate: "2023-05-15T23:59:59Z",
    status: "upcoming",
    createdBy: "admin",
    createdAt: "2023-04-15T00:00:00Z",
    updatedAt: "2023-04-15T00:00:00Z",
    isPrivate: false,
    colleges: [],
    restrictVoting: false,
    eligibleYearLevels: []
  },
  {
    id: "2",
    title: "Department Chair Election",
    description: "Choose the next department chairperson",
    startDate: "2023-04-20T00:00:00Z",
    endDate: "2023-04-25T23:59:59Z",
    status: "active",
    createdBy: "admin",
    createdAt: "2023-04-15T00:00:00Z",
    updatedAt: "2023-04-15T00:00:00Z",
    isPrivate: false,
    colleges: [],
    restrictVoting: false,
    eligibleYearLevels: []
  },
  {
    id: "3",
    title: "Club President Election",
    description: "Vote for your club president",
    startDate: "2023-04-01T00:00:00Z",
    endDate: "2023-04-10T23:59:59Z",
    status: "completed",
    createdBy: "admin",
    createdAt: "2023-03-15T00:00:00Z",
    updatedAt: "2023-03-15T00:00:00Z",
    isPrivate: true,
    accessCode: "club123",
    colleges: [],
    restrictVoting: false,
    eligibleYearLevels: []
  }
];

const ElectionsList: React.FC<ElectionsListProps> = ({ elections = dummyElections }) => {
  return (
    <ul>
      {elections.map((election) => (
        <li key={election.id}>
          {election.title} - {election.status}
        </li>
      ))}
    </ul>
  );
};

export default ElectionsList;
