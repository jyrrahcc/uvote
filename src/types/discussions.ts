
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

// Comment type (adding this as it's referenced in several files)
export interface DiscussionComment {
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

// Poll voter type
export interface PollVoter {
  userId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
}

// Poll results type
export interface PollResults {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
  voters: PollVoter[];
}

// Poll type with camelCase property names
export interface Poll {
  id: string;
  question: string;
  options: Record<string, string>;
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
