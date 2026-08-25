import { NextResponse } from 'next/server';
import { connectDB, User } from '@/models';

export async function GET() {
  try {
    await connectDB();

    const specialists = await User.find({
      role: { $regex: /^specialist$/i },
    })
      .select('name email avatar location role')
      .sort({ createdAt: -1 })
      .lean();

    const data = specialists.map((user) => ({
      id: String(user._id),
      name: user.name,
      institution:
        (user.location as { address?: string } | undefined)?.address ||
        'Bangladesh Agricultural University',
      department: 'Agriculture',
      location: {
        lat: (user.location as { lat?: number } | undefined)?.lat || 23.8103,
        lng: (user.location as { lng?: number } | undefined)?.lng || 90.4125,
        address:
          (user.location as { address?: string } | undefined)?.address ||
          'Bangladesh',
      },
      image:
        (user.avatar as string) ||
        `https://picsum.photos/100/100?q=${String(user._id)}`,
      online: true,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get specialists error:', error);
    return NextResponse.json({ error: 'Failed to load specialists' }, { status: 500 });
  }
}
