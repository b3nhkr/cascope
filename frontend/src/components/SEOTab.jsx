import React, { useEffect, useState } from 'react';
import './Tab.css';

export default function SEOTab() {
  const [domains, setDomains] = useState([]);
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    fetch('/api/domains').then(r => r.json()).then(setDomains);
    fetch('/api/audits').then(r => r.json()).then(setAudits);
  }, []);

  return (
    <div className="tab-panel">
      <h2 className="tab-title">SEO Overview</h2>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Domains Tracked</div>
          <div className="card-value">{domains.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Total Audits</div>
          <div className="card-value">{audits.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Score</div>
          <div className="card-value">
            {audits.length
              ? (audits.reduce((s, a) => s + (a.score || 0), 0) / audits.length).toFixed(1)
              : '—'}
          </div>
        </div>
      </div>

      <h3 className="section-title">Domains</h3>
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>URL</th><th>Added</th></tr>
        </thead>
        <tbody>
          {domains.map(d => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td><a href={d.url} target="_blank" rel="noreferrer">{d.url}</a></td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="section-title">Recent Audits</h3>
      <table className="data-table">
        <thead>
          <tr><th>Domain</th><th>Score</th><th>Issues</th><th>Date</th></tr>
        </thead>
        <tbody>
          {audits.map(a => (
            <tr key={a.id}>
              <td>{a.domain?.name}</td>
              <td>{a.score ?? '—'}</td>
              <td>{a.issues ? JSON.parse(a.issues).join(', ') : '—'}</td>
              <td>{new Date(a.crawledAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
