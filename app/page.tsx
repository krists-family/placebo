import { Home } from '@/components/storefront';
import { catalog, config } from '@/lib/commerce';
export const dynamic = 'force-dynamic';
export default async function Page(){const [products,settings]=await Promise.all([catalog(),config()]);return <Home products={products} config={settings}/>;}
