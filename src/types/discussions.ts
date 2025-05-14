// Discussion topic type
export interface DiscussionTopic {
  id: string;
  title: string;
  content: string;
  electionId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
  } | null;
  repliesCount?: number;
  lastReplyAt?: string;
}

// Reply type
export interface Reply {
  id: string;
  content: string;
  topicId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
  } | null;
}

// Add proper typings for the poll components

export interface PollVoter {
  userId: string;  // Make sure this is included
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
}

export interface PollResults {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
  voters: PollVoter[];  // Update to use PollVoter with userId
}

export interface Poll {
  id: string;
  question: string;
  options: Record<string, string>;  // Define as Record<string, string> to match the expected type
  description?: string;
  electionId: string;
  topicId: string | null;
  createdBy: string;
  createdAt: string;
  endsAt: string | null;
  isClosed: boolean;
  multipleChoice: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
  } | null;
}
