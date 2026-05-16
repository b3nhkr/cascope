import React, { useEffect, useState } from 'react';
import './Tab.css';

export default function GEOTab() {
  const [rankings, setRankings] = useState([]);
  const [cities, setCities] = useState([]);
  const [domains, setDomains] = useState([]);
  const [keywords, setKeywords] = useState([]);

  const [filters, setFilters] = useState({ domainId: '', keywordId: '', cityId: '' });
  const [cityForm, setCityForm] = useState({ name: '', state: '', country: 'US' });

  function loadAll() {
    fetch('/api/cities').then(r => r.json()).then(setCities);
    fetch('/api/domains').then(r => r.json()).then(setDomains);
    fetch('/api/keywords').then(r => r.json()).then(setKeywords);
  }

  function loadRankings() {
    const params = new URLSearchParams();
    if (filters.domainId) params.set('domainId', filters.domainId);
    if (filters.keywordId) params.set('keywordId', filters.keywordId);
    if (filters.cityId) params.set('cityId', filters.cityId);
    fetch(`/api/rankings?${params}`).then(r => r.json()).then(setRankings);
  }

  useEffect(loadAll, []);
  useEffect(loadRankings, [filters]);

  async function addCity(e) {
    e.preventDefault();
    await fetch('/api/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cityForm),
    });
    setCityForm({ name: '', state: '', country: 'US' });
    loadAll();
  }

  function setFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  const filtered = rankings;

  return (
    <div className="tab-panel">
      <h2 className="tab-title">GEO Rankings</h2>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Cities Tracked</div>
          <div className="card-value">{cities.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Rankings Shown</div>
          <div className="card-value">{filtered.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Position</div>
          <div className="card-value">
            {filtered.length
              ? (filtered.reduce((s, r) => s + (r.position || 0), 0) / filtered.length).toFixed(1)
              : '—'}
          </div>
        </div>
      </div>

      <h3 className="section-title">Add City</h3>
      <form className="inline-form" onSubmit={addCity}>
        <input
          className="input"
          type="text"
          placeholder="City"
          value={cityForm.name}
          onChange={e => setCityForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="input input-sm"
          type="text"
          placeholder="State"
          value={cityForm.state}
          onChange={e => setCityForm(f => ({ ...f, state: e.target.value }))}
        />
        <input
          className="input input-sm"
          type="text"
          placeholder="Country"
          value={cityForm.country}
          onChange={e => setCityForm(f => ({ ...f, country: e.target.value }))}
        />
        <button className="btn-primary" type="submit">Add</button>
      </form>

      <h3 className="section-title">Filter Rankings</h3>
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
        {(filters.domainId || filters.keywordId || filters.cityId) && (
          <button className="btn-ghost" onClick={() => setFilters({ domainId: '', keywordId: '', cityId: '' })}>
            Clear
          </button>
        )}
      </div>

      <h3 className="section-title">Rankings</h3>
      <table className="data-table">
        <thead>
          <tr><th>Domain</th><th>Keyword</th><th>City</th><th>Position</th><th>Checked</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={5} className="empty">No rankings match</td></tr>
            : filtered.map(r => (
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
              </tr>
            ))}
        </tbody>
      </table>

      <h3 className="section-title">Cities</h3>
      <table className="data-table">
        <thead>
          <tr><th>City</th><th>State</th><th>Country</th></tr>
        </thead>
        <tbody>
          {cities.length === 0
            ? <tr><td colSpan={3} className="empty">No cities yet</td></tr>
            : cities.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.state || '—'}</td>
                <td>{c.country}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
