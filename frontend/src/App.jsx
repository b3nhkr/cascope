import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">cascope</span>
      </header>
      <Dashboard />
    </div>
  );
}
