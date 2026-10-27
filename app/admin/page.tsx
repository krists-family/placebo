import { redirect } from 'next/navigation';
import { Admin } from '@/components/admin';
import { requireAdmin } from '@/lib/authorization';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getAdminSession } from '@/lib/admin-auth';
import { previewAdmin } from '@/lib/preview-commerce';
import { mode, config } from '@/lib/commerce';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'The back room', robots: { index: false, follow: false } };
export default async function Page() {
  if (await mode() === 'medusa') {
    const c = await config();
    return <Admin initial={{ products: [], orders: [], discounts: [], subscribers: [], inquiries: [], config: c, medusaAdmin: c.medusaAdmin }} user="Medusa" />;
  }
  const session = await getAdminSession();
  if (!session && !(await getChatGPTUser())) redirect('/admin/login');
  const user = await requireAdmin();
  return <Admin initial={await previewAdmin()} user={user.email} />;
}
