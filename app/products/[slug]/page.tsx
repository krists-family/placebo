import { ProductDetail } from '@/components/storefront';import {catalog,config} from '@/lib/commerce';import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=(await catalog()).find(p=>p.slug===slug);return{title:p?.title||'Cap not found',description:p?.subtitle||''};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [ps,c]=await Promise.all([catalog(),config()]);const p=ps.find(p=>p.slug===slug);if(!p)notFound();return <ProductDetail product={p} products={ps} config={c}/>}
