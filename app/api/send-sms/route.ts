import { NextRequest, NextResponse } from 'next/server';
import { db, collection, getDocs, doc, getDoc } from '@/lib/firebase';
import { sendQuestionNotification } from '@/lib/twilio';
import { getTodayQuestionDate } from '@/lib/question-utils';

/**
 * API route to send SMS notifications to users
 * This can be called manually or by a cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request has proper authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get all users who have:
    // 1. Phone number set
    // 2. SMS question alert enabled
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Check if user has phone number
      if (!userData.phoneNumber) {
        results.skipped++;
        continue;
      }

      // Check if SMS notifications are enabled
      if (userData.notifications?.sms?.questionAlert === false) {
        results.skipped++;
        continue;
      }

      // Send SMS
      try {
        await sendQuestionNotification(userData.phoneNumber, todayDate);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`User ${userId}: ${error.message}`);
        console.error(`Failed to send SMS to user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      message: 'SMS notifications processed',
      date: todayDate,
      results,
    });
  } catch (error: any) {
    console.error('Error in send-sms route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

