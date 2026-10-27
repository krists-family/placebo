import { cookies } from 'next/headers';
import { sameOrigin } from '@/lib/authorization';
import { failure } from '@/lib/errors';
import { adminCookieName, sessionCookieOptions } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const jar = await cookies();
    jar.set(adminCookieName(), '', { ...sessionCookieOptions(), maxAge: 0 });
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
