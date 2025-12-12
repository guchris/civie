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

/**
 * Get previous day's date in YYYY-MM-DD format
 */
export function getPreviousDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  return formatDateForQuestion(date);
}

/**
 * User answer interface
 */
export interface UserAnswer {
  status: "answered" | "skipped";
  answerOptionId?: string;
  timestamp: string;
}

/**
 * Calculate user stats from their answers
 * Returns streak (consecutive days answered) and total answered count
 */
export function calculateUserStats(answers: Record<string, UserAnswer> | undefined): {
  streak: number;
  totalAnswered: number;
} {
  if (!answers || Object.keys(answers).length === 0) {
    return { streak: 0, totalAnswered: 0 };
  }

  // Calculate total answered
  const totalAnswered = Object.values(answers).filter(
    (answer) => answer.status === "answered"
  ).length;

  // Calculate streak
  let streak = 0;
  let currentDate = getTodayQuestionDate();
  
  // Check if today is answered - if not, start from yesterday
  const todayAnswer = answers[currentDate];
  if (todayAnswer?.status === "answered") {
    streak = 1;
  } else {
    // Start from yesterday if today not answered
    currentDate = getPreviousDate(currentDate);
    // Check if yesterday is answered, if not streak is 0
    const yesterdayAnswer = answers[currentDate];
    if (yesterdayAnswer?.status !== "answered") {
      return { streak: 0, totalAnswered };
    }
    streak = 1;
  }

  // Go backwards day by day, counting consecutive answered days
  while (true) {
    currentDate = getPreviousDate(currentDate);
    const answer = answers[currentDate];
    
    if (answer?.status === "answered") {
      streak++;
    } else {
      // Stop at first skipped or missing day
      break;
    }
  }

  return { streak, totalAnswered };
}

