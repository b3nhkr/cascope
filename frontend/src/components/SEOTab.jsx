import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './Tab.css';
import './AuditResult.css';

export default function SEOTab() {
  const [domains, setDomains] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [audits, setAudits] = useState([]);

  const [domainForm, setDomainForm] = useState({ name: '', url: '' });
  const [phrase, setPhrase] = useState('');
  const [auditForm, setAuditForm] = useState({ domainId: '', score: '', issues: '' });

  const [auditUrl, setAuditUrl] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);

  function loadAll() {
    apiFetch('/api/domains').then(r => r.json()).then(setDomains);
    apiFetch('/api/keywords').then(r => r.json()).then(setKeywords);
    apiFetch('/api/audits').then(r => r.json()).then(setAudits);
  }

  useEffect(loadAll, []);

  async function runAudit(e) {
    e.preventDefault();
    setAuditLoading(true);
    setAuditError(null);
    setAuditResult(null);
    try {
      const res = await apiFetch('/api/audit/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: auditUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setAuditResult(data);
    } catch (err) {
      setAuditError(err.message);
    } finally {
      setAuditLoading(false);
    }
  }

  async function addDomain(e) {
    e.preventDefault();
    await apiFetch('/api/domains', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(domainForm) });
    setDomainForm({ name: '', url: '' });
    loadAll();
  }

  async function deleteDomain(id) {
    await fetch(`/api/domains/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function addKeyword(e) {
    e.preventDefault();
    await apiFetch('/api/keywords', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phrase: phrase.trim() }) });
    setPhrase('');
    loadAll();
  }

  async function deleteKeyword(id) {
    await fetch(`/api/keywords/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function addAudit(e) {
    e.preventDefault();
    const issues = auditForm.issues ? JSON.stringify(auditForm.issues.split(',').map(s => s.trim()).filter(Boolean)) : null;
    await apiFetch('/api/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domainId: Number(auditForm.domainId), score: auditForm.score ? Number(auditForm.score) : null, issues }) });
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

      {/* Live Audit */}
      <div className="audit-box">
        <div className="audit-box-header">
          <span className="audit-box-title">Live SEO Audit</span>
          <span className="audit-box-sub">Fetches HTML, checks on-page signals, runs PageSpeed Insights</span>
        </div>
        <form className="audit-form" onSubmit={runAudit}>
          <input className="input" type="text" placeholder="example.com or https://example.com"
            value={auditUrl} onChange={e => setAuditUrl(e.target.value)} required />
          <button className="btn-primary" type="submit" disabled={auditLoading}>
            {auditLoading ? 'Auditing…' : 'Run Audit'}
          </button>
        </form>
        {auditError && <div className="alert alert-error">{auditError}</div>}
        {auditResult && <SeoAuditResult result={auditResult} />}
      </div>

      <div className="card-grid">
        <div className="card"><div className="card-label">Domains</div><div className="card-value">{domains.length}</div></div>
        <div className="card"><div className="card-label">Keywords</div><div className="card-value">{keywords.length}</div></div>
        <div className="card"><div className="card-label">Audits</div><div className="card-value">{audits.length}</div></div>
        <div className="card"><div className="card-label">Avg Score</div><div className="card-value">{avgScore}</div></div>
      </div>

      <h3 className="section-title">Domains</h3>
      <form className="inline-form" onSubmit={addDomain}>
        <input className="input" type="text" placeholder="Domain name (e.g. example.com)" value={domainForm.name} onChange={e => setDomainForm(f => ({ ...f, name: e.target.value }))} required />
        <input className="input" type="url" placeholder="URL (https://...)" value={domainForm.url} onChange={e => setDomainForm(f => ({ ...f, url: e.target.value }))} required />
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

      <h3 className="section-title">Keywords</h3>
      <form className="inline-form" onSubmit={addKeyword}>
        <input className="input" type="text" placeholder="e.g. seo agency near me" value={phrase} onChange={e => setPhrase(e.target.value)} required />
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

      <h3 className="section-title">Saved Audits</h3>
      <form className="inline-form" onSubmit={addAudit}>
        <select className="select" value={auditForm.domainId} onChange={e => setAuditForm(f => ({ ...f, domainId: e.target.value }))} required>
          <option value="">Select domain…</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <input className="input input-sm" type="number" min="0" max="100" placeholder="Score" value={auditForm.score} onChange={e => setAuditForm(f => ({ ...f, score: e.target.value }))} />
        <input className="input" type="text" placeholder="Issues (comma-separated)" value={auditForm.issues} onChange={e => setAuditForm(f => ({ ...f, issues: e.target.value }))} />
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

function ScoreBadge({ score }) {
  const cls = score >= 80 ? 'score-great' : score >= 50 ? 'score-ok' : 'score-poor';
  return <span className={`score-badge ${cls}`}>{score}</span>;
}

function SeoAuditResult({ result }) {
  const { score, on_page, pagespeed, robots_txt, sitemap_xml, issues, warnings, passes } = result;

  return (
    <div className="audit-result-box">
      <div className="audit-score-row">
        <div className="audit-score-main">
          <ScoreBadge score={score} />
          <span className="audit-score-label">Overall SEO Score</span>
        </div>
        <div className="audit-meta-pills">
          <span className={`meta-pill ${robots_txt ? 'pill-green' : 'pill-red'}`}>robots.txt {robots_txt ? '✓' : '✗'}</span>
          <span className={`meta-pill ${sitemap_xml ? 'pill-green' : 'pill-red'}`}>sitemap.xml {sitemap_xml ? '✓' : '✗'}</span>
        </div>
      </div>

      {/* On-page signals */}
      <div className="audit-section-label">On-Page Signals</div>
      <div className="signal-grid">
        <SignalRow label="Title" value={on_page.title} max={60} />
        <SignalRow label="Meta Description" value={on_page.description} max={160} />
        <SignalRow label="H1" value={on_page.h1s?.[0]} note={on_page.h1s?.length > 1 ? `+${on_page.h1s.length - 1} more` : null} />
        <SignalRow label="Canonical" value={on_page.canonical} />
        <SignalRow label="Robots Meta" value={on_page.robots || 'not set'} />
        {on_page.imgsWithoutAlt > 0 && (
          <SignalRow label="Images missing alt" value={String(on_page.imgsWithoutAlt)} warn />
        )}
      </div>

      {/* PageSpeed */}
      {pagespeed && (
        <>
          <div className="audit-section-label">PageSpeed Insights (Mobile)</div>
          <div className="ps-grid">
            <PsScore label="Performance" score={pagespeed.performance} />
            <PsScore label="Accessibility" score={pagespeed.accessibility} />
            <PsScore label="Best Practices" score={pagespeed.bestPractices} />
            <PsScore label="SEO" score={pagespeed.seo} />
          </div>
          <div className="ps-vitals">
            {[['FCP', pagespeed.fcp], ['LCP', pagespeed.lcp], ['CLS', pagespeed.cls], ['TBT', pagespeed.tbt], ['Speed Index', pagespeed.speedIndex]].map(([k, v]) =>
              v ? <span key={k} className="vital-chip"><span className="vital-key">{k}</span> {v}</span> : null
            )}
          </div>
        </>
      )}

      {/* Issues / warnings / passes */}
      {issues.length > 0 && (
        <><div className="audit-section-label">Issues</div>
          <ul className="finding-list">
            {issues.map((s, i) => <li key={i} className="finding-issue">{s}</li>)}
          </ul>
        </>
      )}
      {warnings.length > 0 && (
        <><div className="audit-section-label">Warnings</div>
          <ul className="finding-list">
            {warnings.map((s, i) => <li key={i} className="finding-warning">{s}</li>)}
          </ul>
        </>
      )}
      {passes.length > 0 && (
        <><div className="audit-section-label">Passing</div>
          <ul className="finding-list">
            {passes.map((s, i) => <li key={i} className="finding-pass">{s}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

function SignalRow({ label, value, max, note, warn }) {
  const truncated = value && max && value.length > max + 10 ? value.slice(0, max + 10) + '…' : value;
  return (
    <div className={`signal-row${warn ? ' signal-warn' : ''}`}>
      <span className="signal-label">{label}</span>
      <span className="signal-value">{truncated || <em className="signal-missing">missing</em>}
        {note && <span className="signal-note"> {note}</span>}
        {max && value && <span className="signal-len"> ({value.length})</span>}
      </span>
    </div>
  );
}

function PsScore({ label, score }) {
  const cls = score >= 90 ? 'ps-great' : score >= 50 ? 'ps-ok' : 'ps-poor';
  return (
    <div className={`ps-score-box ${cls}`}>
      <div className="ps-score-num">{score}</div>
      <div className="ps-score-label">{label}</div>
    </div>
  );
}
