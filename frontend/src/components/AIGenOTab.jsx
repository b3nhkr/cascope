import React, { useState } from 'react';
import './Tab.css';

export default function AIGenOTab() {
  const [domainName, setDomainName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runAudit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/audit-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Audit failed');
      }
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-panel">
      <h2 className="tab-title">AIGenO Audit</h2>
      <p className="tab-description">
        Run an AI-powered generative optimization audit against a tracked domain.
      </p>

      <form className="audit-form" onSubmit={runAudit}>
        <input
          className="input"
          type="text"
          placeholder="Domain name (e.g. example.com)"
          value={domainName}
          onChange={e => setDomainName(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Running…' : 'Run Audit'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="audit-result">
          <div className="card-grid">
            <div className="card">
              <div className="card-label">Score</div>
              <div className="card-value">{result.score}</div>
            </div>
            <div className="card">
              <div className="card-label">Domain</div>
              <div className="card-value">{result.domain?.name}</div>
            </div>
            <div className="card">
              <div className="card-label">Issues Found</div>
              <div className="card-value">
                {result.issues ? JSON.parse(result.issues).length : 0}
              </div>
            </div>
          </div>

          {result.issues && JSON.parse(result.issues).length > 0 && (
            <>
              <h3 className="section-title">Issues</h3>
              <ul className="issue-list">
                {JSON.parse(result.issues).map((issue, i) => (
                  <li key={i} className="issue-item">{issue}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
