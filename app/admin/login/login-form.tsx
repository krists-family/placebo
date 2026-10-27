'use client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d: any = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not sign in.');
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 26 }}>
      <div className="field">
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <p className="error-note">{error}</p>}
      <button className="btn full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <p style={{ marginTop: 20, fontSize: 14 }}>
        <a className="text-link" href="/">Back to the storefront</a>
      </p>
    </form>
  );
}
