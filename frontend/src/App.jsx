import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import { getToken, clearToken } from './api';
import './App.css';

export default function App() {
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail'));
  const authed = !!getToken() && !!email;

  function handleAuth(userEmail) {
    setEmail(userEmail);
  }

  function logout() {
    clearToken();
    setEmail(null);
  }

  if (!authed) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">cascope</span>
        <div className="header-right">
          <span className="user-email">{email}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>
      <Dashboard />
    </div>
  );
}
