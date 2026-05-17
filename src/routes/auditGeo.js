const { Router } = require('express');

module.exports = () => {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const { domain, keyword, city, state, country = 'US' } = req.body;
      if (!domain || !keyword || !city) {
        return res.status(400).json({ error: 'domain, keyword, and city are required' });
      }

      const login = process.env.DATAFORSEO_LOGIN;
      const password = process.env.DATAFORSEO_PASSWORD;
      if (!login || !password) {
        return res.status(503).json({ error: 'DataForSEO credentials not configured (set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD)' });
      }

      const result = await runGeoAudit({ domain, keyword, city, state, country, login, password });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};

async function runGeoAudit({ domain, keyword, city, state, country, login, password }) {
  const locationName = state ? `${city},${state},${country}` : `${city},${country}`;
  const searchQuery = keyword;

  const credentials = Buffer.from(`${login}:${password}`).toString('base64');

  const body = [
    {
      keyword: searchQuery,
      location_name: locationName,
      language_code: 'en',
      depth: 30,
      se_domain: 'google.com',
    },
  ];

  const resp = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DataForSEO error ${resp.status}: ${text.slice(0, 200)}`);
  }

  const data = await resp.json();
  const task = data.tasks?.[0];

  if (!task || task.status_code !== 20000) {
    throw new Error(task?.status_message || 'DataForSEO task failed');
  }

  const items = task.result?.[0]?.items ?? [];
  const organicItems = items.filter(i => i.type === 'organic');

  const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  let domainPosition = null;
  let domainResult = null;

  for (const item of organicItems) {
    const itemDomain = (item.domain || '').replace(/^www\./, '');
    if (itemDomain === normalizedDomain || itemDomain.includes(normalizedDomain)) {
      domainPosition = item.rank_absolute;
      domainResult = {
        position: item.rank_absolute,
        url: item.url,
        title: item.title,
        description: item.description,
      };
      break;
    }
  }

  const top10 = organicItems.slice(0, 10).map(item => ({
    position: item.rank_absolute,
    domain: item.domain,
    url: item.url,
    title: item.title,
  }));

  const visibilityScore = domainPosition
    ? Math.max(0, Math.round(100 - (domainPosition - 1) * (100 / 30)))
    : 0;

  return {
    domain,
    keyword,
    location: { city, state: state || null, country },
    position: domainPosition,
    found: domainPosition !== null,
    visibility_score: visibilityScore,
    domain_result: domainResult,
    top_10: top10,
    total_results: task.result?.[0]?.items_count ?? 0,
  };
}
