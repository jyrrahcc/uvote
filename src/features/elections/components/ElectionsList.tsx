
// Add the missing properties for upcoming, active, and completed elections
const upcomingElection: Election = {
  id: "1",
  title: "Student Council Elections 2023",
  description: "Annual elections for the Student Council positions",
  startDate: "2023-05-15T08:00:00Z",
  endDate: "2023-05-16T17:00:00Z",
  status: "upcoming" as const,
  createdBy: "admin-id",
  createdAt: "2023-04-01T00:00:00Z",
  updatedAt: "2023-04-01T00:00:00Z",
  isPrivate: false,
  colleges: [],
  candidacyStartDate: "2023-04-15T08:00:00Z", // Add missing property
  candidacyEndDate: "2023-04-30T17:00:00Z", // Add missing property
  positions: ["President", "Vice President", "Secretary"], // Add missing property
  allowFaculty: false // Add missing property
};

const activeElection: Election = {
  id: "2",
  title: "Department Representatives Election",
  description: "Election for department representatives across all colleges",
  startDate: "2023-03-10T08:00:00Z",
  endDate: "2023-03-20T17:00:00Z",
  status: "active" as const,
  createdBy: "admin-id",
  createdAt: "2023-02-15T00:00:00Z",
  updatedAt: "2023-02-15T00:00:00Z",
  isPrivate: false,
  colleges: [],
  candidacyStartDate: "2023-02-15T08:00:00Z", // Add missing property
  candidacyEndDate: "2023-02-28T17:00:00Z", // Add missing property
  positions: ["Department Representative"], // Add missing property
  allowFaculty: false // Add missing property
};

const completedElection: Election = {
  id: "3",
  title: "Faculty Senate Election",
  description: "Election for Faculty Senate positions",
  startDate: "2023-01-05T08:00:00Z",
  endDate: "2023-01-10T17:00:00Z",
  status: "completed" as const,
  createdBy: "admin-id",
  createdAt: "2022-12-20T00:00:00Z",
  updatedAt: "2022-12-20T00:00:00Z",
  isPrivate: true,
  accessCode: "FACULTY2023",
  colleges: [],
  candidacyStartDate: "2022-12-01T08:00:00Z", // Add missing property
  candidacyEndDate: "2022-12-15T17:00:00Z", // Add missing property
  positions: ["Faculty Senate Chair", "Faculty Senate Secretary"], // Add missing property
  allowFaculty: true // Add missing property
};
