import React, { useState } from 'react';
import SEOTab from './SEOTab';
import GEOTab from './GEOTab';
import AIGenOTab from './AIGenOTab';
import './Dashboard.css';

const TABS = [
  { id: 'seo', label: 'SEO' },
  { id: 'geo', label: 'GEO' },
  { id: 'aigeno', label: 'AIGenO' },
];

export default function Dashboard() {
  const [active, setActive] = useState('seo');

  return (
    <div className="dashboard">
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${active === tab.id ? ' active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="tab-content">
        {active === 'seo' && <SEOTab />}
        {active === 'geo' && <GEOTab />}
        {active === 'aigeno' && <AIGenOTab />}
      </div>
    </div>
  );
}
