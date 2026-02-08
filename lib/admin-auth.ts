import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Checks if the current user has admin role.
 * Returns the session if admin, or a 403 NextResponse if not.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: 'Не сте влезли в акаунта си' }, { status: 401 }),
    };
  }

  if ((session.user as any).role !== 'admin') {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: 'Нямате администраторски достъп' }, { status: 403 }),
    };
  }

  return {
    authorized: true as const,
    session,
  };
}
