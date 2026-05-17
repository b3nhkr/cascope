const { Router } = require('express');
const cheerio = require('cheerio');

module.exports = () => {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ error: 'domain is required' });

      const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
      const result = await runSeoAudit(baseUrl, domain);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};

async function runSeoAudit(baseUrl, domain) {
  const issues = [];
  const warnings = [];
  const passes = [];
  let score = 100;

  // --- Fetch HTML ---
  let html = '';
  let fetchOk = false;
  try {
    const resp = await fetch(baseUrl, {
      headers: { 'User-Agent': 'CascopeBot/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (resp.ok) {
      html = await resp.text();
      fetchOk = true;
    } else {
      issues.push(`Site returned HTTP ${resp.status}`);
      score -= 20;
    }
  } catch {
    issues.push('Could not reach the domain');
    score -= 30;
  }

  // --- Parse HTML ---
  const on_page = { title: null, description: null, canonical: null, robots: null, h1s: [], h2s: [], imgsWithoutAlt: 0 };

  if (fetchOk && html) {
    const $ = cheerio.load(html);

    on_page.title = $('title').first().text().trim() || null;
    on_page.description = $('meta[name="description"]').attr('content') || null;
    on_page.canonical = $('link[rel="canonical"]').attr('href') || null;
    on_page.robots = $('meta[name="robots"]').attr('content') || null;
    on_page.h1s = $('h1').map((_, el) => $(el).text().trim()).get();
    on_page.h2s = $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 10);
    on_page.imgsWithoutAlt = $('img:not([alt])').length + $('img[alt=""]').length;

    if (!on_page.title) { issues.push('Missing <title> tag'); score -= 15; }
    else if (on_page.title.length < 10) { warnings.push('Title is very short'); score -= 5; }
    else if (on_page.title.length > 60) { warnings.push('Title exceeds 60 characters'); score -= 3; }
    else passes.push('Title tag present');

    if (!on_page.description) { issues.push('Missing meta description'); score -= 10; }
    else if (on_page.description.length < 50) { warnings.push('Meta description is very short'); score -= 3; }
    else if (on_page.description.length > 160) { warnings.push('Meta description exceeds 160 characters'); score -= 3; }
    else passes.push('Meta description present');

    if (on_page.h1s.length === 0) { issues.push('No H1 tag found'); score -= 10; }
    else if (on_page.h1s.length > 1) { warnings.push(`Multiple H1 tags (${on_page.h1s.length})`); score -= 5; }
    else passes.push('Single H1 tag present');

    if (!on_page.canonical) { warnings.push('No canonical URL set'); score -= 5; }
    else passes.push('Canonical URL set');

    if (on_page.robots && on_page.robots.includes('noindex')) {
      issues.push('Page has noindex robots meta — search engines will not index this page');
      score -= 20;
    }

    if (on_page.imgsWithoutAlt > 0) {
      warnings.push(`${on_page.imgsWithoutAlt} image(s) missing alt text`);
      score -= Math.min(on_page.imgsWithoutAlt * 2, 10);
    } else if (fetchOk) {
      passes.push('All images have alt text');
    }
  }

  // --- robots.txt ---
  const robotsUrl = new URL('/robots.txt', baseUrl).href;
  let hasRobots = false;
  try {
    const r = await fetch(robotsUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    hasRobots = r.ok;
  } catch {}
  if (hasRobots) passes.push('robots.txt found');
  else { warnings.push('robots.txt not found'); score -= 5; }

  // --- sitemap.xml ---
  const sitemapUrl = new URL('/sitemap.xml', baseUrl).href;
  let hasSitemap = false;
  try {
    const r = await fetch(sitemapUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    hasSitemap = r.ok;
  } catch {}
  if (hasSitemap) passes.push('sitemap.xml found');
  else { warnings.push('sitemap.xml not found'); score -= 5; }

  // --- PageSpeed Insights ---
  let pagespeed = null;
  try {
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(baseUrl)}&strategy=mobile`;
    const psResp = await fetch(psUrl, { signal: AbortSignal.timeout(30000) });
    if (psResp.ok) {
      const psData = await psResp.json();
      const cats = psData.lighthouseResult?.categories;
      const audits = psData.lighthouseResult?.audits;
      pagespeed = {
        performance: Math.round((cats?.performance?.score ?? 0) * 100),
        accessibility: Math.round((cats?.accessibility?.score ?? 0) * 100),
        bestPractices: Math.round((cats?.['best-practices']?.score ?? 0) * 100),
        seo: Math.round((cats?.seo?.score ?? 0) * 100),
        fcp: audits?.['first-contentful-paint']?.displayValue ?? null,
        lcp: audits?.['largest-contentful-paint']?.displayValue ?? null,
        cls: audits?.['cumulative-layout-shift']?.displayValue ?? null,
        tbt: audits?.['total-blocking-time']?.displayValue ?? null,
        tti: audits?.['interactive']?.displayValue ?? null,
        speedIndex: audits?.['speed-index']?.displayValue ?? null,
      };
      // Blend PageSpeed perf score into overall score (20% weight)
      score = Math.round(score * 0.8 + pagespeed.performance * 0.2);
    }
  } catch {
    warnings.push('PageSpeed Insights unavailable');
  }

  return {
    domain,
    url: baseUrl,
    score: Math.max(0, Math.min(100, score)),
    on_page,
    pagespeed,
    robots_txt: hasRobots,
    sitemap_xml: hasSitemap,
    issues,
    warnings,
    passes,
  };
}
