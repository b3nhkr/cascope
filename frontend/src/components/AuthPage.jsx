import React, { useState } from 'react';
import { setToken } from '../api';
import './AuthPage.css';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      setToken(data.token);
      localStorage.setItem('userEmail', data.email);
      onAuth(data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">cascope</div>
        <p className="auth-tagline">Search intelligence, unified.</p>
        <div className="auth-tabs">
          <button className={`auth-tab${mode === 'login' ? ' active' : ''}`} onClick={() => { setMode('login'); setError(null); }}>Login</button>
          <button className={`auth-tab${mode === 'register' ? ' active' : ''}`} onClick={() => { setMode('register'); setError(null); }}>Register</button>
        </div>
        <form onSubmit={submit}>
          <input className="auth-input" type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required autoFocus />
          <input className="auth-input" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
