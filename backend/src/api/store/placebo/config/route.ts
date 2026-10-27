import type { MedusaRequest,MedusaResponse } from '@medusajs/framework/http';
export async function GET(req:MedusaRequest,res:MedusaResponse){const service:any=req.scope.resolve('placebo');const [record]=await service.listPlaceboRecords({key:'config'});if(!record)return res.status(503).json({message:'Initialize the shop catalog and content before opening.'});res.json({config:record.payload});}
