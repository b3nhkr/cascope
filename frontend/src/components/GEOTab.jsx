import React, { useEffect, useState } from 'react';
import './Tab.css';

export default function GEOTab() {
  const [rankings, setRankings] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetch('/api/rankings').then(r => r.json()).then(setRankings);
    fetch('/api/cities').then(r => r.json()).then(setCities);
  }, []);

  return (
    <div className="tab-panel">
      <h2 className="tab-title">GEO Rankings</h2>

      <div className="card-grid">
        <div className="card">
          <div className="card-label">Cities Tracked</div>
          <div className="card-value">{cities.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Total Rankings</div>
          <div className="card-value">{rankings.length}</div>
        </div>
        <div className="card">
          <div className="card-label">Avg Position</div>
          <div className="card-value">
            {rankings.length
              ? (rankings.reduce((s, r) => s + (r.position || 0), 0) / rankings.length).toFixed(1)
              : '—'}
          </div>
        </div>
      </div>

      <h3 className="section-title">Rankings</h3>
      <table className="data-table">
        <thead>
          <tr><th>Domain</th><th>Keyword</th><th>City</th><th>Position</th><th>Checked</th></tr>
        </thead>
        <tbody>
          {rankings.map(r => (
            <tr key={r.id}>
              <td>{r.domain?.name}</td>
              <td>{r.keyword?.phrase}</td>
              <td>{r.city?.name}, {r.city?.state}</td>
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
    </div>
  );
}
