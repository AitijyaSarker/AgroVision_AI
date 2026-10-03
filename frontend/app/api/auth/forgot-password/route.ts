import { createHmac, randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, PasswordReset, User } from '@/models';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashResetCode(email: string, code: string, secret: string) {
  return createHmac('sha256', secret).update(`${email}:${code}`).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    const sender = process.env.RESEND_FROM_EMAIL?.trim();
    const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
    if (!resendKey || !sender || !secret || secret === 'your-secret-key') {
      return NextResponse.json(
        { error: 'Password recovery email is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and a strong PASSWORD_RESET_SECRET.' },
        { status: 503 }
      );
    }

    await connectDB();

    const previous = await PasswordReset.findOne({ email }).select('lastSentAt').lean();
    if (previous && Date.now() - new Date(previous.lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
      return NextResponse.json({
        message: 'If an account exists for this email, a verification code will arrive shortly.',
      });
    }

    const user = await User.findOne({ email }).select('_id').lean();
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists for this email, a verification code will arrive shortly.',
      });
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [email],
        subject: 'Your AgroVision password reset code',
        text: `Your AgroVision password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Password reset email delivery failed:', response.status, details);
      return NextResponse.json(
        { error: 'Could not send the password recovery email. Check the Resend sender configuration and try again.' },
        { status: 502 }
      );
    }

    const now = new Date();
    await PasswordReset.findOneAndUpdate(
      { email },
      {
        $set: {
          codeHash: hashResetCode(email, code, secret),
          attempts: 0,
          lastSentAt: now,
          expiresAt: new Date(now.getTime() + CODE_TTL_MS),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'If an account exists for this email, a verification code will arrive shortly.',
    });
  } catch (error) {
    console.error('Forgot-password request failed:', error);
    return NextResponse.json({ error: 'Unable to start password recovery right now.' }, { status: 500 });
  }
}
