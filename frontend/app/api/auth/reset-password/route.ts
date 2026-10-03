import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB, PasswordReset, User } from '@/models';

const MAX_ATTEMPTS = 5;

function hashResetCode(email: string, code: string, secret: string) {
  return createHmac('sha256', secret).update(`${email}:${code}`).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
    if (!secret || secret === 'your-secret-key') {
      return NextResponse.json({ error: 'Password recovery is not configured.' }, { status: 503 });
    }

    await connectDB();

    const reset = await PasswordReset.findOne({
      email,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_ATTEMPTS },
    }).select('codeHash').lean();

    const submittedHash = Buffer.from(hashResetCode(email, code, secret), 'hex');
    const storedHash = reset ? Buffer.from(reset.codeHash, 'hex') : Buffer.alloc(0);
    const validCode =
      !!reset &&
      submittedHash.length === storedHash.length &&
      timingSafeEqual(submittedHash, storedHash);

    if (!validCode) {
      await PasswordReset.updateOne(
        { email, expiresAt: { $gt: new Date() }, attempts: { $lt: MAX_ATTEMPTS } },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    const consumed = await PasswordReset.findOneAndDelete({
      email,
      codeHash: reset.codeHash,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_ATTEMPTS },
    });
    if (!consumed) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await User.updateOne(
      { email },
      { $set: { password: passwordHash, updatedAt: new Date() } }
    );
    if (result.matchedCount !== 1) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json({ error: 'Unable to reset the password right now.' }, { status: 500 });
  }
}
