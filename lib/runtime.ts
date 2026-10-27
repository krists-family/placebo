export async function runtime(): Promise<Record<string, any>> {
  try { return (await import('cloudflare:workers')).env as Record<string,any>; }
  catch { return process.env; }
}
export class ShopError extends Error { constructor(message:string,public status=400){super(message)} }
export const uid=(prefix='')=>prefix+crypto.randomUUID().replaceAll('-','');
export const now=()=>new Date().toISOString();
