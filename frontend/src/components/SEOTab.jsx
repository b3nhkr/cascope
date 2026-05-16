import React, { useEffect, useState } from 'react';
import './Tab.css';

export default function SEOTab() {
  const [domains, setDomains] = useState([]);
  const [audits, setAudits] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [phrase, setPhrase] = useState('');

  function loadAll() {
    fetch('/api/domains').then(r => r.json()).then(setDomains);
    fetch('/api/audits').then(r => r.json()).then(setAudits);
    fetch('/api/keywords').then(r => r.json()).then(setKeywords);
  }

  useEffect(loadAll, []);

  async function addKeyword(e) {
    e.preventDefault();
    if (!phrase.trim()) return;
    await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase: phrase.trim() }),
    });
    setPhrase('');
    loadAll();
  }

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
        <div className="card">
          <div className="card-label">Keywords</div>
          <div className="card-value">{keywords.length}</div>
        </div>
      </div>

      <h3 className="section-title">Add Keyword</h3>
      <form className="inline-form" onSubmit={addKeyword}>
        <input
          className="input"
          type="text"
          placeholder="e.g. seo agency near me"
          value={phrase}
          onChange={e => setPhrase(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">Add</button>
      </form>

      <h3 className="section-title">Keywords</h3>
      <table className="data-table">
        <thead>
          <tr><th>Phrase</th><th>Added</th></tr>
        </thead>
        <tbody>
          {keywords.length === 0
            ? <tr><td colSpan={2} className="empty">No keywords yet</td></tr>
            : keywords.map(k => (
              <tr key={k.id}>
                <td>{k.phrase}</td>
                <td>{new Date(k.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
        </tbody>
      </table>

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
