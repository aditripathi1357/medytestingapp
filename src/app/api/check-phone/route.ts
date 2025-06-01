// app/api/check-phone/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../firebase/firebaseAdmin';

interface FirebaseAuthError extends Error {
  code?: string;
}

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.getUserByPhoneNumber(phoneNumber);

    return NextResponse.json({
      success: true,
      exists: true,
      uid: userRecord.uid,
    });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err as FirebaseAuthError).code === 'auth/user-not-found'
    ) {
      return NextResponse.json({
        success: true,
        exists: false,
      });
    }

    console.error('[CHECK_PHONE_ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Server error while checking phone number' },
      { status: 500 }
    );
  }
}