import React, { useState } from 'react';
import { apiFetch } from '../api';
import './Tab.css';
import './AuditResult.css';

export default function AIGenOTab() {
  const [domain, setDomain] = useState('');
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runAudit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch('/api/audit/aigen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), keyword: keyword.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-panel">
      <h2 className="tab-title">AIGenO</h2>
      <p className="tab-description">
        AI-generative optimization audit — checks how Claude perceives your domain's authority and citation worthiness.
      </p>

      <form className="audit-form" onSubmit={runAudit}>
        <input className="input" type="text" placeholder="Domain (e.g. example.com)"
          value={domain} onChange={e => setDomain(e.target.value)} required />
        <input className="input" type="text" placeholder="Target keyword (optional)"
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Asking Claude…' : 'Run Audit'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && <AigenResult result={result} />}
    </div>
  );
}

function AigenResult({ result }) {
  const {
    citation_score, known, recognition_level, summary,
    keyword_relevance, recommendations, ai_confidence, tokens_used, keyword,
  } = result;

  const levelLabel = {
    'well-known': 'Well Known',
    'moderately-known': 'Moderately Known',
    'niche': 'Niche',
    'unknown': 'Unknown',
  }[recognition_level] ?? recognition_level;

  const levelClass = {
    'well-known': 'pill-green',
    'moderately-known': 'pill-yellow',
    'niche': 'pill-yellow',
    'unknown': 'pill-red',
  }[recognition_level] ?? '';

  return (
    <div className="audit-result-box">
      <div className="audit-score-row">
        <div className="audit-score-main">
          <span className={`score-badge ${citation_score >= 70 ? 'score-great' : citation_score >= 40 ? 'score-ok' : 'score-poor'}`}>
            {citation_score}
          </span>
          <span className="audit-score-label">Citation Score</span>
        </div>
        <div className="audit-meta-pills">
          <span className={`meta-pill ${known ? 'pill-green' : 'pill-red'}`}>{known ? 'Known to AI' : 'Not recognized'}</span>
          <span className={`meta-pill ${levelClass}`}>{levelLabel}</span>
          <span className="meta-pill pill-neutral">Confidence {ai_confidence}%</span>
        </div>
      </div>

      <div className="audit-section-label">AI Knowledge Summary</div>
      <p className="audit-prose">{summary}</p>

      {keyword && keyword_relevance && (
        <>
          <div className="audit-section-label">Keyword Relevance — "{keyword}"</div>
          <p className="audit-prose">{keyword_relevance}</p>
        </>
      )}

      {recommendations?.length > 0 && (
        <>
          <div className="audit-section-label">AIGenO Recommendations</div>
          <ul className="finding-list">
            {recommendations.map((r, i) => <li key={i} className="finding-warning">{r}</li>)}
          </ul>
        </>
      )}

      <div className="audit-footer-meta">
        Powered by claude-sonnet-4-6 · {tokens_used?.toLocaleString()} tokens used
      </div>
    </div>
  );
}
