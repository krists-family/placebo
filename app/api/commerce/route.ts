import { cookies } from 'next/headers';
import { failure } from '@/lib/errors';
import { mode, catalog, config } from '@/lib/commerce';
import { uid, ShopError } from '@/lib/runtime';
import { sameOrigin } from '@/lib/authorization';
import * as p from '@/lib/preview-commerce';
import * as m from '@/lib/medusa-commerce';
export const dynamic='force-dynamic';
async function visitor(){const jar=await cookies();let id=jar.get('placebo_visitor')?.value;if(!id||!/^visitor_[a-f0-9]{32}$/.test(id)){id=uid('visitor_');jar.set('placebo_visitor',id,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*90});}return id;}

const json=(data:any)=>Response.json(data,{headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){try{const url=new URL(req.url),action=url.searchParams.get('action')||'cart';const medusa=(await mode())==='medusa';if(action==='catalog')return json({products:await catalog(),config:await config()});const id=await visitor();if(action==='order'){const orderId=url.searchParams.get('id')||'';return json({order:medusa?await m.medusaOrder(id,orderId):await p.previewOrder(id,orderId)});}return json({cart:medusa?await m.medusaCart(id):await p.previewCart(id)});}catch(e){return failure(e);}}
export async function POST(req:Request){try{sameOrigin(req);if(Number(req.headers.get('content-length')||0)>20000)throw new ShopError('Request too large.',413);const data:any=await req.json();if(JSON.stringify(data).length>20000)throw new ShopError('Request too large.',413);const medusa=(await mode())==='medusa';const action=data.action;if(action==='subscribe')return json(medusa?await m.medusaSubscribe(data):await p.previewSubscribe(data));if(action==='inquiry')return json(medusa?await m.medusaInquiry(data):await p.previewInquiry(data));const id=await visitor();if(medusa){const result:any=await m.medusaAction(id,action,data);return json(result.order||result.clientSecret?result:{cart:result});}switch(action){case 'add':return json({cart:await p.previewAdd(id,data)});case 'update':return json({cart:await p.previewUpdate(id,data)});case 'discount':return json({cart:await p.previewDiscount(id,data)});case 'country':return json({cart:await p.previewCountry(id,data)});case 'checkout':return json(await p.previewCheckout(id,data));default:throw new ShopError('Unknown action.');}}catch(e){return failure(e);}}
