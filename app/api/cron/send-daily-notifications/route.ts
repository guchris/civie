import { NextRequest, NextResponse } from 'next/server';
import { db, collection, getDocs, doc, setDoc, getDoc } from '@/lib/firebase';
import { sendQuestionNotification } from '@/lib/twilio';
import { getTodayQuestionDate } from '@/lib/question-utils';

/**
 * Cron job that runs at 9:05 AM UTC daily to send SMS notifications to all users.
 * 
 * This should be configured in vercel.json to run at 9:05 AM UTC.
 */
export async function GET(request: NextRequest) {
  try {
    // Check for test mode (allows bypassing auth for testing)
    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('test') === 'true';
    
    // Verify this is a cron request from Vercel (unless in test mode)
    if (!isTestMode) {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
      
      // Note: Vercel automatically sets VERCEL_CRON_SECRET for cron jobs
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    const todayDate = getTodayQuestionDate();
    
    // Check if today's question exists
    const questionRef = doc(db, 'questions', todayDate);
    const questionSnap = await getDoc(questionRef);
    
    if (!questionSnap.exists()) {
      return NextResponse.json(
        { message: 'No question available for today', date: todayDate },
        { status: 200 }
      );
    }

    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const results = {
      checked: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      results.checked++;

      // Skip if user doesn't have phone number
      if (!userData.phoneNumber) {
        results.skipped++;
        continue;
      }

      // Skip if SMS notifications are disabled
      if (userData.notifications?.sms?.questionAlert === false) {
        results.skipped++;
        continue;
      }

      try {
        // Check if we've already sent today to prevent duplicates
        const lastNotificationDate = userData.lastSmsNotificationDate;
        if (lastNotificationDate === todayDate) {
          results.skipped++;
          continue;
        }
        
        // Send notification
        await sendQuestionNotification(userData.phoneNumber, todayDate);
        
        // Update user document to track that we sent today
        await setDoc(
          doc(db, 'users', userId),
          {
            lastSmsNotificationDate: todayDate,
            lastSmsNotificationTime: now.toISOString(),
          },
          { merge: true }
        );
        
        results.sent++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`User ${userId}: ${error.message}`);
        console.error(`Failed to send SMS to user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      timestamp: now.toISOString(),
      date: todayDate,
      results,
    });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

