
/**
 * Format a date string to be more readable
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a date string to a relative format (e.g. "in 2 days" or "2 days ago")
 */
export const formatDateRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`;
  } else if (diffDays < 0) {
    const absDiffDays = Math.abs(diffDays);
    return absDiffDays === 1 ? 'yesterday' : `${absDiffDays} days ago`;
  } else {
    return 'today';
  }
};

/**
 * Format a date string to local date string
 */
export const formatDateToLocalString = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
