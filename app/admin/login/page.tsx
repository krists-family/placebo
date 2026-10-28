import { redirect } from 'next/navigation';
import { credentialsConfigured, getAdminSession } from '@/lib/admin-auth';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default async function Page() {
  if (await getAdminSession()) redirect('/admin');
  return (
    <div className="page-wrap">
      <div className="narrow" style={{ maxWidth: 420 }}>
        <a href="/" className="logo"><img src="/placebo-logo.svg" alt="Placebo"/></a>
        <p className="eyebrow" style={{ marginTop: 30 }}>The back room</p>
        <h1 className="display" style={{ fontSize: 52 }}>Sign in.</h1>
        {credentialsConfigured() ? <LoginForm /> : <p className="error-note">Admin login is not configured yet.</p>}
      </div>
    </div>
  );
}
