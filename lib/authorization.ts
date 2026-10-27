import { getChatGPTUser, type ChatGPTUser } from '@/app/chatgpt-auth';
import { getAdminSession } from './admin-auth';
import { runtime, ShopError } from './runtime';

export async function requireAdmin(): Promise<ChatGPTUser> {
  const session = await getAdminSession();
  if (session) {
    return { userId: `admin:${session.email}`, displayName: session.email, email: session.email, fullName: null };
  }
  const e = await runtime();
  const user = await getChatGPTUser();
  if (!user) throw new ShopError('Sign in to access the admin.', 401);
  const allowed = String(e.ADMIN_USER_IDS || '').split(',').filter(Boolean);
  if (allowed.includes(user.userId)) return user;
  if (e.PRIVATE_ADMIN_ENABLED === 'true') return user;
  throw new ShopError('Admin access is not enabled for this account.', 403);
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  const url = new URL(req.url);
  // Next.js can use an internal hostname in req.url. Check the incoming host.
  const host = req.headers.get('host') || url.host;
  const protocol = (req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')).split(',')[0].trim();
  if (!origin || origin !== protocol + '://' + host) throw new ShopError('Please perform this action from the shop.', 403);
}
