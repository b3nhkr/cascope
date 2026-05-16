import React, { useEffect, useState } from 'react';
import './Tab.css';

export default function SEOTab() {
  const [domains, setDomains] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [audits, setAudits] = useState([]);

  const [domainForm, setDomainForm] = useState({ name: '', url: '' });
  const [phrase, setPhrase] = useState('');
  const [auditForm, setAuditForm] = useState({ domainId: '', score: '', issues: '' });

  function loadAll() {
    fetch('/api/domains').then(r => r.json()).then(setDomains);
    fetch('/api/keywords').then(r => r.json()).then(setKeywords);
    fetch('/api/audits').then(r => r.json()).then(setAudits);
  }

  useEffect(loadAll, []);

  async function addDomain(e) {
    e.preventDefault();
    await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(domainForm),
    });
    setDomainForm({ name: '', url: '' });
    loadAll();
  }

  async function deleteDomain(id) {
    await fetch(`/api/domains/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function addKeyword(e) {
    e.preventDefault();
    await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase: phrase.trim() }),
    });
    setPhrase('');
    loadAll();
  }

  async function deleteKeyword(id) {
    await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function addAudit(e) {
    e.preventDefault();
    const issues = auditForm.issues
      ? JSON.stringify(auditForm.issues.split(',').map(s => s.trim()).filter(Boolean))
      : null;
    await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domainId: Number(auditForm.domainId),
        score: auditForm.score ? Number(auditForm.score) : null,
        issues,
      }),
    });
    setAuditForm({ domainId: '', score: '', issues: '' });
    loadAll();
  }

  async function deleteAudit(id) {
    await fetch(`/api/audits/${id}`, { method: 'DELETE' });
    loadAll();
  }

  const avgScore = audits.length
    ? (audits.reduce((s, a) => s + (a.score || 0), 0) / audits.length).toFixed(1)
    : '—';

  return (
    <div className="tab-panel">
      <h2 className="tab-title">SEO</h2>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Domains</div>
          <div className="card-value">{domains.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Keywords</div>
          <div className="card-value">{keywords.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Audits</div>
          <div className="card-value">{audits.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Score</div>
          <div className="card-value">{avgScore}</div>
        </div>
      </div>

      {/* Domains */}
      <h3 className="section-title">Domains</h3>
      <form className="inline-form" onSubmit={addDomain}>
        <input className="input" type="text" placeholder="Domain name (e.g. example.com)"
          value={domainForm.name} onChange={e => setDomainForm(f => ({ ...f, name: e.target.value }))} required />
        <input className="input" type="url" placeholder="URL (https://...)"
          value={domainForm.url} onChange={e => setDomainForm(f => ({ ...f, url: e.target.value }))} required />
        <button className="btn-primary" type="submit">Add</button>
      </form>
      <table className="data-table">
        <thead><tr><th>Name</th><th>URL</th><th>Added</th><th></th></tr></thead>
        <tbody>
          {domains.length === 0
            ? <tr><td colSpan={4} className="empty">No domains yet</td></tr>
            : domains.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td><a href={d.url} target="_blank" rel="noreferrer">{d.url}</a></td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td><button className="btn-delete" onClick={() => deleteDomain(d.id)}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Keywords */}
      <h3 className="section-title">Keywords</h3>
      <form className="inline-form" onSubmit={addKeyword}>
        <input className="input" type="text" placeholder="e.g. seo agency near me"
          value={phrase} onChange={e => setPhrase(e.target.value)} required />
        <button className="btn-primary" type="submit">Add</button>
      </form>
      <table className="data-table">
        <thead><tr><th>Phrase</th><th>Added</th><th></th></tr></thead>
        <tbody>
          {keywords.length === 0
            ? <tr><td colSpan={3} className="empty">No keywords yet</td></tr>
            : keywords.map(k => (
              <tr key={k.id}>
                <td>{k.phrase}</td>
                <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                <td><button className="btn-delete" onClick={() => deleteKeyword(k.id)}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Audits */}
      <h3 className="section-title">Audits</h3>
      <form className="inline-form" onSubmit={addAudit}>
        <select className="select" value={auditForm.domainId}
          onChange={e => setAuditForm(f => ({ ...f, domainId: e.target.value }))} required>
          <option value="">Select domain…</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className="input input-sm" type="number" min="0" max="100" placeholder="Score"
          value={auditForm.score} onChange={e => setAuditForm(f => ({ ...f, score: e.target.value }))} />
        <input className="input" type="text" placeholder="Issues (comma-separated)"
          value={auditForm.issues} onChange={e => setAuditForm(f => ({ ...f, issues: e.target.value }))} />
        <button className="btn-primary" type="submit">Add</button>
      </form>
      <table className="data-table">
        <thead><tr><th>Domain</th><th>Score</th><th>Issues</th><th>Date</th><th></th></tr></thead>
        <tbody>
          {audits.length === 0
            ? <tr><td colSpan={5} className="empty">No audits yet</td></tr>
            : audits.map(a => (
              <tr key={a.id}>
                <td>{a.domain?.name}</td>
                <td>{a.score ?? '—'}</td>
                <td>{a.issues ? JSON.parse(a.issues).join(', ') : '—'}</td>
                <td>{new Date(a.crawledAt).toLocaleDateString()}</td>
                <td><button className="btn-delete" onClick={() => deleteAudit(a.id)}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
