import {Checkout} from '@/components/checkout';import {config} from '@/lib/commerce';
export const dynamic='force-dynamic';export const metadata={title:'Checkout',robots:{index:false,follow:false}};export default async function Page(){return <Checkout config={await config()}/>}
