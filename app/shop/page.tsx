import { Shop } from '@/components/storefront';import { catalog,config } from '@/lib/commerce';
export const dynamic='force-dynamic';export const metadata={title:'The collection'};
export default async function Page(){const [products,c]=await Promise.all([catalog(),config()]);return <Shop products={products} config={c}/>}
