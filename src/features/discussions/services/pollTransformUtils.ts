
import { Poll } from "@/types";

// Helper function to transform poll data from the database
export const transformPollData = (dbPoll: any, creator?: any): Poll => {
  // Parse options from string or use as is if already an object
  let parsedOptions: Record<string, string> = {};
  
  try {
    if (typeof dbPoll.options === 'string') {
      const optionsArray = JSON.parse(dbPoll.options);
      if (Array.isArray(optionsArray)) {
        optionsArray.forEach((option: any) => {
          if (option.id && option.text) {
            parsedOptions[option.id] = option.text;
          }
        });
      }
    } else if (Array.isArray(dbPoll.options)) {
      dbPoll.options.forEach((option: any) => {
        if (option.id && option.text) {
          parsedOptions[option.id] = option.text;
        }
      });
    } else if (typeof dbPoll.options === 'object' && dbPoll.options !== null) {
      parsedOptions = dbPoll.options;
    }
  } catch (error) {
    console.error("Error parsing poll options:", error);
    // Default to empty options if parsing fails
    parsedOptions = {};
  }
  
  return {
    id: dbPoll.id,
    question: dbPoll.question,
    description: dbPoll.description || undefined,
    options: parsedOptions,
    multipleChoice: dbPoll.multiple_choice || false,
    isClosed: dbPoll.is_closed || false,
    createdAt: dbPoll.created_at,
    endsAt: dbPoll.ends_at || undefined,
    electionId: dbPoll.election_id,
    topicId: dbPoll.topic_id || undefined,
    createdBy: dbPoll.created_by,
    author: creator || null
  };
};
