import {Receipt} from '@/components/checkout';import {config} from '@/lib/commerce';
export const dynamic='force-dynamic';export const metadata={title:'Your order',robots:{index:false,follow:false}};export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Receipt id={id} config={await config()}/>}
