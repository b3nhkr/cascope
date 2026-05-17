import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './Tab.css';
import './AuditResult.css';

export default function GEOTab() {
  const [rankings, setRankings] = useState([]);
  const [cities, setCities] = useState([]);
  const [domains, setDomains] = useState([]);
  const [keywords, setKeywords] = useState([]);

  const [filters, setFilters] = useState({ domainId: '', keywordId: '', cityId: '' });
  const [cityForm, setCityForm] = useState({ name: '', state: '', country: 'US' });
  const [rankingForm, setRankingForm] = useState({ domainId: '', keywordId: '', cityId: '', position: '', url: '' });

  const [geoForm, setGeoForm] = useState({ domain: '', keyword: '', city: '', state: '', country: 'US' });
  const [geoResult, setGeoResult] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  function loadBase() {
    apiFetch('/api/cities').then(r => r.json()).then(setCities);
    apiFetch('/api/domains').then(r => r.json()).then(setDomains);
    apiFetch('/api/keywords').then(r => r.json()).then(setKeywords);
  }

  function loadRankings() {
    const params = new URLSearchParams();
    if (filters.domainId) params.set('domainId', filters.domainId);
    if (filters.keywordId) params.set('keywordId', filters.keywordId);
    if (filters.cityId) params.set('cityId', filters.cityId);
    fetch(`/api/rankings?${params}`).then(r => r.json()).then(data => setRankings(Array.isArray(data) ? data : []));
  }

  useEffect(loadBase, []);
  useEffect(loadRankings, [filters]);

  async function runGeoAudit(e) {
    e.preventDefault();
    setGeoLoading(true);
    setGeoError(null);
    setGeoResult(null);
    try {
      const res = await apiFetch('/api/audit/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: geoForm.domain.trim(),
          keyword: geoForm.keyword.trim(),
          city: geoForm.city.trim(),
          state: geoForm.state.trim() || undefined,
          country: geoForm.country.trim() || 'US',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'GEO audit failed');
      setGeoResult(data);
    } catch (err) {
      setGeoError(err.message);
    } finally {
      setGeoLoading(false);
    }
  }

  async function addCity(e) {
    e.preventDefault();
    await apiFetch('/api/cities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cityForm) });
    setCityForm({ name: '', state: '', country: 'US' });
    loadBase();
  }

  async function deleteCity(id) {
    await fetch(`/api/cities/${id}`, { method: 'DELETE' });
    loadBase();
    loadRankings();
  }

  async function addRanking(e) {
    e.preventDefault();
    await apiFetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domainId: Number(rankingForm.domainId),
        keywordId: Number(rankingForm.keywordId),
        cityId: Number(rankingForm.cityId),
        position: rankingForm.position ? Number(rankingForm.position) : null,
        url: rankingForm.url || null,
      }),
    });
    setRankingForm({ domainId: '', keywordId: '', cityId: '', position: '', url: '' });
    loadRankings();
  }

  async function deleteRanking(id) {
    await fetch(`/api/rankings/${id}`, { method: 'DELETE' });
    loadRankings();
  }

  function setFilter(key, val) { setFilters(f => ({ ...f, [key]: val })); }
  const hasFilter = filters.domainId || filters.keywordId || filters.cityId;

  return (
    <div className="tab-panel">
      <h2 className="tab-title">GEO</h2>

      {/* Live GEO Audit */}
      <div className="audit-box">
        <div className="audit-box-header">
          <span className="audit-box-title">Live GEO Ranking Audit</span>
          <span className="audit-box-sub">Checks local SERP position via DataForSEO (requires credentials)</span>
        </div>
        <form className="inline-form" onSubmit={runGeoAudit} style={{ marginBottom: 12 }}>
          <input className="input" type="text" placeholder="Domain (e.g. example.com)"
            value={geoForm.domain} onChange={e => setGeoForm(f => ({ ...f, domain: e.target.value }))} required />
          <input className="input" type="text" placeholder="Keyword"
            value={geoForm.keyword} onChange={e => setGeoForm(f => ({ ...f, keyword: e.target.value }))} required />
          <input className="input input-sm" type="text" placeholder="City"
            value={geoForm.city} onChange={e => setGeoForm(f => ({ ...f, city: e.target.value }))} required />
          <input className="input input-sm" type="text" placeholder="State"
            value={geoForm.state} onChange={e => setGeoForm(f => ({ ...f, state: e.target.value }))} />
          <button className="btn-primary" type="submit" disabled={geoLoading}>
            {geoLoading ? 'Checking…' : 'Run Audit'}
          </button>
        </form>
        {geoError && <div className="alert alert-error">{geoError}</div>}
        {geoResult && <GeoAuditResult result={geoResult} />}
      </div>

      <div className="card-grid">
        <div className="card"><div className="card-label">Cities</div><div className="card-value">{cities.length}</div></div>
        <div className="card"><div className="card-label">Rankings Shown</div><div className="card-value">{rankings.length}</div></div>
        <div className="card">
          <div className="card-label">Avg Position</div>
          <div className="card-value">
            {Array.isArray(rankings) && rankings.length
              ? (rankings.reduce((s, r) => s + (r.position || 0), 0) / rankings.length).toFixed(1)
              : '—'}
          </div>
        </div>
      </div>

      <h3 className="section-title">Cities</h3>
      <form className="inline-form" onSubmit={addCity}>
        <input className="input" type="text" placeholder="City" value={cityForm.name} onChange={e => setCityForm(f => ({ ...f, name: e.target.value }))} required />
        <input className="input input-sm" type="text" placeholder="State" value={cityForm.state} onChange={e => setCityForm(f => ({ ...f, state: e.target.value }))} />
        <input className="input input-sm" type="text" placeholder="Country" value={cityForm.country} onChange={e => setCityForm(f => ({ ...f, country: e.target.value }))} />
        <button className="btn-primary" type="submit">Add</button>
      </form>
      <table className="data-table">
        <thead><tr><th>City</th><th>State</th><th>Country</th><th></th></tr></thead>
        <tbody>
          {cities.length === 0
            ? <tr><td colSpan={4} className="empty">No cities yet</td></tr>
            : cities.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.state || '—'}</td>
                <td>{c.country}</td>
                <td><button className="btn-delete" onClick={() => deleteCity(c.id)}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>

      <h3 className="section-title">Rankings</h3>
      <form className="inline-form" onSubmit={addRanking}>
        <select className="select" value={rankingForm.domainId} onChange={e => setRankingForm(f => ({ ...f, domainId: e.target.value }))} required>
          <option value="">Domain…</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="select" value={rankingForm.keywordId} onChange={e => setRankingForm(f => ({ ...f, keywordId: e.target.value }))} required>
          <option value="">Keyword…</option>
          {keywords.map(k => <option key={k.id} value={k.id}>{k.phrase}</option>)}
        </select>
        <select className="select" value={rankingForm.cityId} onChange={e => setRankingForm(f => ({ ...f, cityId: e.target.value }))} required>
          <option value="">City…</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}{c.state ? `, ${c.state}` : ''}</option>)}
        </select>
        <input className="input input-sm" type="number" min="1" placeholder="Pos" value={rankingForm.position} onChange={e => setRankingForm(f => ({ ...f, position: e.target.value }))} />
        <input className="input" type="url" placeholder="Ranking URL (optional)" value={rankingForm.url} onChange={e => setRankingForm(f => ({ ...f, url: e.target.value }))} />
        <button className="btn-primary" type="submit">Add</button>
      </form>

      <div className="filter-row">
        <select className="select" value={filters.domainId} onChange={e => setFilter('domainId', e.target.value)}>
          <option value="">All Domains</option>
          {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="select" value={filters.keywordId} onChange={e => setFilter('keywordId', e.target.value)}>
          <option value="">All Keywords</option>
          {keywords.map(k => <option key={k.id} value={k.id}>{k.phrase}</option>)}
        </select>
        <select className="select" value={filters.cityId} onChange={e => setFilter('cityId', e.target.value)}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}{c.state ? `, ${c.state}` : ''}</option>)}
        </select>
        {hasFilter && <button className="btn-ghost" onClick={() => setFilters({ domainId: '', keywordId: '', cityId: '' })}>Clear filters</button>}
      </div>

      <table className="data-table">
        <thead><tr><th>Domain</th><th>Keyword</th><th>City</th><th>Position</th><th>Checked</th><th></th></tr></thead>
        <tbody>
          {!Array.isArray(rankings) || rankings.length === 0
            ? <tr><td colSpan={6} className="empty">No rankings match</td></tr>
            : rankings.map(r => (
              <tr key={r.id}>
                <td>{r.domain?.name}</td>
                <td>{r.keyword?.phrase}</td>
                <td>{r.city?.name}{r.city?.state ? `, ${r.city.state}` : ''}</td>
                <td>
                  <span className={`badge ${r.position <= 3 ? 'badge-green' : r.position <= 10 ? 'badge-yellow' : 'badge-red'}`}>
                    #{r.position}
                  </span>
                </td>
                <td>{new Date(r.checkedAt).toLocaleDateString()}</td>
                <td><button className="btn-delete" onClick={() => deleteRanking(r.id)}>Delete</button></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function GeoAuditResult({ result }) {
  const { position, found, visibility_score, domain_result, top_10, keyword, location } = result;
  const locStr = [location.city, location.state, location.country].filter(Boolean).join(', ');

  return (
    <div className="audit-result-box">
      <div className="audit-score-row">
        <div className="audit-score-main">
          <span className={`score-badge ${visibility_score >= 70 ? 'score-great' : visibility_score >= 30 ? 'score-ok' : 'score-poor'}`}>
            {visibility_score}
          </span>
          <span className="audit-score-label">Visibility Score</span>
        </div>
        <div className="audit-meta-pills">
          {found
            ? <span className="meta-pill pill-green">Ranked #{position}</span>
            : <span className="meta-pill pill-red">Not in top 30</span>}
          <span className="meta-pill pill-neutral">"{keyword}" in {locStr}</span>
        </div>
      </div>

      {domain_result && (
        <>
          <div className="audit-section-label">Your Result</div>
          <div className="geo-result-card">
            <div className="geo-pos">#{domain_result.position}</div>
            <div className="geo-result-body">
              <div className="geo-result-title">{domain_result.title}</div>
              <div className="geo-result-url">{domain_result.url}</div>
              {domain_result.description && <div className="geo-result-desc">{domain_result.description}</div>}
            </div>
          </div>
        </>
      )}

      {top_10?.length > 0 && (
        <>
          <div className="audit-section-label">Top 10 Results</div>
          <table className="data-table">
            <thead><tr><th>#</th><th>Domain</th><th>Title</th></tr></thead>
            <tbody>
              {top_10.map(item => (
                <tr key={item.position}>
                  <td><span className={`badge ${item.position <= 3 ? 'badge-green' : 'badge-yellow'}`}>#{item.position}</span></td>
                  <td>{item.domain}</td>
                  <td>{item.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
