# SMS Notification Setup Guide

This guide will help you set up Twilio SMS notifications for daily question alerts.

## Overview

The SMS notification system sends text messages to users at 9:05 AM UTC daily when a new question becomes available. The system uses:

- **Twilio** for sending SMS messages
- **Vercel Cron** for scheduled execution (runs at 9:05 AM UTC)
- **Firebase Firestore** for storing user phone numbers

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. A Twilio phone number with SMS capabilities
3. Your app deployed on Vercel (for cron jobs)

## Step 1: Set Up Twilio

1. **Create a Twilio Account**
   - Go to https://www.twilio.com and sign up
   - Verify your account and phone number

2. **Get a Twilio Phone Number**
   - In the Twilio Console, go to Phone Numbers > Manage > Buy a number
   - Purchase a phone number with SMS capabilities
   - Note the phone number (e.g., +1234567890)

3. **Get Your Credentials**
   - In the Twilio Console, go to Account > API Keys & Tokens
   - Find your Account SID and Auth Token
   - Save these for the next step

## Step 2: Configure Environment Variables

Add the following environment variables to your Vercel project (or `.env.local` for local development):

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number in E.164 format

# Cron Job Security (optional but recommended)
CRON_SECRET=your_random_secret_here  # Generate a random string for security

# App URL (if different from default)
NEXT_PUBLIC_APP_URL=https://civie.org  # Your app's public URL
```

### Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable above
4. Make sure to add them for all environments (Production, Preview, Development)

## Step 3: Configure Vercel Cron

The cron job is already configured in `vercel.json` to run every minute. Vercel will automatically set up the cron job when you deploy.

**Important**: For the cron job to work:
1. Your project must be deployed on Vercel
2. The cron job will run automatically based on the schedule in `vercel.json`
3. Vercel will send requests to `/api/cron/send-daily-notifications` with an authorization header

### Cron Schedule

The current configuration runs daily at 9:05 AM UTC (`5 9 * * *`). All users with phone numbers and SMS notifications enabled will receive a text message at this time.

## Step 4: User Setup

Users need to:

1. **Add Phone Number**
   - Go to Profile > Identity tab
   - Click "Edit" next to Phone Number
   - Enter phone number in international format (e.g., +1234567890)
   - Click "Save"

2. **Enable SMS Notifications**
   - Go to Profile > Settings tab
   - Under "SMS Notifications", ensure "New question alert" is enabled

## Step 5: Testing

### Test the SMS Service Locally

You can test sending SMS manually by calling the API route:

```bash
curl -X POST http://localhost:3000/api/send-sms \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

### Test the Cron Job

The cron job will automatically run on Vercel. You can also trigger it manually:

```bash
curl -X GET https://your-domain.com/api/cron/send-daily-notifications \
  -H "Authorization: Bearer your_cron_secret"
```

## How It Works

1. **Cron Job Execution**: Daily at 9:05 AM UTC, Vercel calls `/api/cron/send-daily-notifications`
2. **User Check**: For each user with a phone number:
   - The system checks if they have SMS notifications enabled
   - If yes, and they haven't received a notification today, it sends an SMS
3. **Duplicate Prevention**: The system tracks `lastSmsNotificationDate` to prevent sending multiple notifications per day
4. **Question Check**: The system verifies that today's question exists before sending

## Monitoring

Check your Vercel logs to monitor:
- How many users were checked
- How many SMS messages were sent
- Any errors that occurred

You can also check Twilio's dashboard for:
- SMS delivery status
- Failed messages
- Usage and billing

## Troubleshooting

### SMS Not Sending

1. **Check Twilio Credentials**
   - Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
   - Ensure `TWILIO_PHONE_NUMBER` is in E.164 format

2. **Check User Data**
   - Verify users have `phoneNumber` set
   - Check that `notifications.sms.questionAlert` is `true`

3. **Check Cron Job**
   - Verify the cron job is running (check Vercel logs)
   - Ensure `CRON_SECRET` matches if you set one

4. **Check Twilio Console**
   - Look for error messages in Twilio's logs
   - Verify your Twilio account has sufficient credits

### Timing

- Notifications are sent at 9:05 AM UTC daily
- If you need a different time, update the cron schedule in `vercel.json`

## Cost Considerations

- Twilio charges per SMS sent (typically $0.0075-$0.01 per message in the US)
- Monitor your usage in the Twilio Console
- Consider setting up usage alerts in Twilio

## Security Notes

1. **Cron Secret**: Always set `CRON_SECRET` in production to prevent unauthorized access
2. **Phone Number Validation**: The system accepts phone numbers in E.164 format
3. **Rate Limiting**: Consider adding rate limiting if you have many users

## Next Steps

- Consider adding email notifications as a backup
- Add retry logic for failed SMS sends
- Implement user opt-in/opt-out functionality
- Add analytics to track notification effectiveness

