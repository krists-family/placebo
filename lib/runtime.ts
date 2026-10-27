import { createD1Shim } from './d1-shim';

let shim: ReturnType<typeof createD1Shim> | undefined;

export async function runtime(): Promise<Record<string, any>> {
  try { return (await import('cloudflare:workers')).env as Record<string, any>; }
  catch {
    const env = process.env as Record<string, any>;
    if (env.DATABASE_URL) {
      shim ??= createD1Shim(env.DATABASE_URL);
      return { ...env, DB: shim };
    }
    return env;
  }
}
export class ShopError extends Error { constructor(message:string,public status=400){super(message)} }
export const uid=(prefix='')=>prefix+crypto.randomUUID().replaceAll('-','');
export const now=()=>new Date().toISOString();
