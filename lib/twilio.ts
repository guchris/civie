import twilio from 'twilio';

// Initialize Twilio client
export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
  }

  return twilio(accountSid, authToken);
}

/**
 * Send SMS notification to a user about a new question
 */
export async function sendQuestionNotification(
  phoneNumber: string,
  questionDate: string
): Promise<void> {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable is not set.');
  }

  // Format the date for display (e.g., "Dec 15")
  const date = new Date(questionDate + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${months[date.getMonth()]} ${date.getDate()}`;

  const message = `New civie question available for ${formattedDate}! Answer now: ${process.env.NEXT_PUBLIC_APP_URL || 'https://civie.org'}/dashboard`;

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber,
    });
  } catch (error: any) {
    console.error(`Failed to send SMS to ${phoneNumber}:`, error);
    throw error;
  }
}

/**
 * Validate phone number format (E.164 format)
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Normalize phone number to E.164 format
 * This is a basic implementation - you may want to use a library like libphonenumber-js for better validation
 */
export function normalizePhoneNumber(phoneNumber: string, countryCode: string = '+1'): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it already starts with +, return as is (assuming it's already in E.164)
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // If it starts with 1 (US/Canada), add +
  if (digits.startsWith('1') && digits.length === 11) {
    return '+' + digits;
  }
  
  // Otherwise, add country code (defaulting to +1 for US)
  return countryCode + digits;
}

