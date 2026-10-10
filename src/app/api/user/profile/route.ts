import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AVATAR_STYLES, cleanSeed, formatAvatar, type AvatarStyleId } from '@/lib/avatars';
import { sendWelcomeOnce } from '@/lib/email/welcome';
import { prisma } from '@/lib/prisma';

/**
 * Sets the traveller's display name (and optionally their avatar). Used by the
 * "What should we call you?" step for people who signed in by email link, who
 * arrive without a name; their welcome email waits until they've given one.
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (name.length < 1) return NextResponse.json({ success: false, error: 'Tell us what to call you.' }, { status: 400 });
  if (/[<>{}]|https?:\/\//i.test(name)) return NextResponse.json({ success: false, error: 'Just a name, please.' }, { status: 400 });

  const data: { name: string; image?: string } = { name };
  if (body.style && body.seed) {
    const seed = cleanSeed(String(body.seed));
    if (!AVATAR_STYLES.some((a) => a.id === body.style) || !seed) {
      return NextResponse.json({ success: false, error: 'Pick one of the avatars shown.' }, { status: 400 });
    }
    data.image = formatAvatar({ style: body.style as AvatarStyleId, seed });
  }

  const user = await prisma.user.update({ where: { email: session.user.email }, data, select: { id: true, name: true, image: true } });
  await sendWelcomeOnce(user.id);
  return NextResponse.json({ success: true, data: { name: user.name, image: user.image } });
}
