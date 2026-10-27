import { z } from 'zod';
import { cookies } from 'next/headers';
import { sameOrigin } from '@/lib/authorization';
import { failure } from '@/lib/errors';
import { ShopError } from '@/lib/runtime';
import {
  adminCookieName,
  checkCredentials,
  createSessionToken,
  credentialsConfigured,
  sessionCookieOptions,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const body = schema.parse(await req.json());
    if (!credentialsConfigured()) throw new ShopError('Admin login is not configured.', 503);
    if (!checkCredentials(body.email, body.password)) throw new ShopError('Incorrect email or password.', 401);
    const jar = await cookies();
    jar.set(adminCookieName(), createSessionToken(body.email), sessionCookieOptions());
    return Response.json({ ok: true, email: body.email });
  } catch (e) {
    return failure(e);
  }
}
