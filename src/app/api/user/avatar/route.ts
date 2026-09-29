import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AVATAR_STYLES, cleanSeed, formatAvatar, type AvatarStyleId } from '@/lib/avatars';

// Saves the traveller's chosen avatar on their profile (replacing the Google photo).
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const style = String(body.style ?? '');
  const seed = cleanSeed(String(body.seed ?? ''));
  if (!AVATAR_STYLES.some((a) => a.id === style) || !seed) {
    return NextResponse.json({ success: false, error: 'Pick one of the avatars shown.' }, { status: 400 });
  }

  const image = formatAvatar({ style: style as AvatarStyleId, seed });
  await prisma.user.update({ where: { email: session.user.email }, data: { image } });
  return NextResponse.json({ success: true, data: { image } });
}
