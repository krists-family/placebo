import { z } from 'zod';
import { ShopError } from './runtime';
export function failure(e:unknown){if(e instanceof z.ZodError)return Response.json({error:e.issues[0]?.message||'Please check the form.'},{status:400});if(e instanceof ShopError)return Response.json({error:e.message},{status:e.status});console.error('Shop request failed',e);return Response.json({error:'The shop is temporarily unavailable. Your changes have not been lost. Please try again.'},{status:503});}
