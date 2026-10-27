import type { Metadata } from 'next';
import { ShopProvider } from '@/components/shop-provider';
import './globals.css';
export const metadata: Metadata = {title:{default:'Placebo | A little dose of personality',template:'%s | Placebo'},description:'Embroidered scrub caps for the people who care. Discover a little personality for your everyday uniform.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><ShopProvider>{children}</ShopProvider></body></html>}
