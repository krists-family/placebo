import { runtime } from './runtime';
import { previewCatalog, previewConfig } from './preview-commerce';
import { medusaCatalog, medusaConfig } from './medusa-commerce';
export async function mode(){return (await runtime()).COMMERCE_MODE==='medusa'?'medusa':'preview';}
export async function catalog(){return (await mode())==='medusa'?medusaCatalog():previewCatalog();}
export async function config(){return (await mode())==='medusa'?medusaConfig():previewConfig();}
