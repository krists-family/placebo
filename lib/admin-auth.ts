import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'placebo_admin';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AdminSession = { email: string };

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD_HASH || 'placebo-dev-session-secret';
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password: string, stored: string) {
  const [algo, salt, hash] = (stored || '').split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  if (!expected.length) return false;
  const candidate = scryptSync(password, salt, expected.length);
  return timingSafeEqual(candidate, expected);
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + SESSION_MAX_AGE * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data?.e !== 'string' || typeof data?.x !== 'number' || data.x < Date.now()) return null;
    return { email: data.e };
  } catch {
    return null;
  }
}

export function adminCookieName() {
  return COOKIE;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

export function credentialsConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH);
}

export function checkCredentials(email: string, password: string) {
  if (!credentialsConfigured()) return false;
  const expected = String(process.env.ADMIN_EMAIL).trim().toLowerCase();
  return email.trim().toLowerCase() === expected && verifyPassword(password, String(process.env.ADMIN_PASSWORD_HASH));
}
