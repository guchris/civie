/**
 * Calculate today's question date based on 2 AM local time cutoff
 * If current time is before 2 AM, use yesterday's date
 * If current time is 2 AM or later, use today's date
 */
export function getTodayQuestionDate(): string {
  const now = new Date();
  const localHour = now.getHours();
  
  // If before 2 AM, use yesterday's date
  if (localHour < 2) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateForQuestion(yesterday);
  }
  
  // Otherwise use today's date
  return formatDateForQuestion(now);
}

/**
 * Format a date as YYYY-MM-DD for use as question document ID
 */
export function formatDateForQuestion(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the deadline for today's question (next day at 2 AM local time)
 */
export function getQuestionDeadline(): Date {
  const now = new Date();
  const deadline = new Date(now);
  
  // Set deadline to next day at 2 AM
  deadline.setDate(deadline.getDate() + 1);
  deadline.setHours(2, 0, 0, 0);
  
  return deadline;
}

/**
 * Calculate time remaining until deadline
 * Returns formatted string like "18 hours left" or "2 hours left"
 */
export function getTimeRemaining(): string {
  const deadline = getQuestionDeadline();
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return "Expired";
  }
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  } else {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
  }
}

/**
 * Calculate age from birth date string (YYYY-MM-DD format)
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date for display (e.g., "Dec 15")
 */
export function formatQuestionDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

