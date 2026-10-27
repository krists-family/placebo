import { requireAdmin, sameOrigin } from '@/lib/authorization';
import { mode, config } from '@/lib/commerce';
import { previewAdmin, previewAdminAction } from '@/lib/preview-commerce';
import { ShopError } from '@/lib/runtime';
import { failure } from '@/lib/errors';
export const dynamic='force-dynamic';
export async function GET(){try{await requireAdmin();if(await mode()==='medusa')return Response.json({medusaAdmin:(await config()).medusaAdmin});return Response.json(await previewAdmin(),{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(req:Request){try{sameOrigin(req);await requireAdmin();if(await mode()==='medusa')throw new ShopError('Use Medusa Admin to manage the live store.');const body:any=await req.json();if(JSON.stringify(body).length>100000)throw new ShopError('Request too large.',413);return Response.json(await previewAdminAction(body.action,body.data));}catch(e){return failure(e);}}
