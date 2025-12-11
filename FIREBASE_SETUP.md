# Firebase Email Link Authentication Setup Guide

This guide will walk you through setting up Firebase email link authentication for Civie.

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if you haven't)
3. Click the gear icon ⚙️ next to "Project Overview" and select **Project Settings**
4. Scroll down to the "Your apps" section
5. If you don't have a web app yet:
   - Click the **</>** (Web) icon
   - Register your app with a nickname (e.g., "Civie Web")
   - Click "Register app"
6. Copy the `firebaseConfig` object values

## Step 2: Create Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables with your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:** Replace all the placeholder values with your actual Firebase config values.

## Step 3: Enable Email Link Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password** (or **Email link** if available)
3. Enable **Email link (passwordless sign-in)**
4. Click **Save**

## Step 3.5: Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
4. Select a location for your database
5. Click **Enable**

**Note:** For production, you'll want to set up proper security rules. For now, test mode will work for development.

## Step 3.6: Enable Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
4. Select a location for your storage (should match your Firestore location)
5. Click **Done**

**Note:** For production, you'll want to set up proper security rules to protect user uploads.

## Step 4: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Make sure your domain is listed:
   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)
3. If you need to add a domain, click **Add domain**

## Step 5: Configure Email Templates (Optional)

1. In Firebase Console, go to **Authentication** > **Templates**
2. Customize the email templates for:
   - **Email address verification**
   - **Password reset** (if using password auth)
3. You can customize the email subject and body to match your brand

## Step 6: Test the Flow

1. Start your development server: `npm run dev`
2. Navigate to `/signup`
3. Enter an email address
4. Click "Create Account"
5. Check your email for the sign-in link
6. Click the link in the email
7. You should be redirected to `/auth/callback` and then to `/verify`

## How It Works

1. **Signup/Login**: User enters email → Firebase sends email with magic link
2. **Email Link**: User clicks link → Redirects to `/auth/callback`
3. **Verification**: Callback page verifies the link → Signs user in
4. **Redirect**: User is redirected to `/verify` for identity verification
5. **Dashboard**: After verification, user goes to `/dashboard`

## Troubleshooting

### "Invalid API key" error
- Make sure your `.env.local` file has the correct values
- Restart your dev server after changing `.env.local`
- Check that environment variables start with `NEXT_PUBLIC_`

### "Email link expired" error
- Email links expire after 1 hour by default
- User needs to request a new link

### "Invalid or expired sign-in link" error
- Make sure the link hasn't been used already
- Check that the authorized domain is configured correctly
- Verify the callback URL matches what's in `actionCodeSettings`

### Email not received
- Check spam/junk folder
- Verify email address is correct
- Check Firebase Console > Authentication > Users to see if user was created
- Check Firebase Console > Usage and billing for email quota

## Next Steps

After setting up email link authentication, you may want to:
- Add user profile management
- Store user data in Firestore
- Add role-based access control
- Implement session management

## Resources

- [Firebase Email Link Auth Documentation](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

