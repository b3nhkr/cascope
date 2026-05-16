const { Router } = require('express');

module.exports = (prisma) => {
  const router = Router();

  // POST /api/audit-client
  // Accepts a domain name (or id), runs a basic audit, and persists the result.
  router.post('/', async (req, res, next) => {
    try {
      const { domainId, domainName } = req.body;

      let domain;
      if (domainId) {
        domain = await prisma.domain.findUnique({ where: { id: Number(domainId) } });
      } else if (domainName) {
        domain = await prisma.domain.findUnique({ where: { name: domainName } });
      }

      if (!domain) {
        return res.status(404).json({ error: 'Domain not found. Provide domainId or domainName.' });
      }

      const auditResult = runBasicAudit(domain);

      const audit = await prisma.audit.create({
        data: {
          domainId: domain.id,
          score: auditResult.score,
          issues: JSON.stringify(auditResult.issues),
        },
        include: { domain: true },
      });

      res.status(201).json(audit);
    } catch (err) {
      next(err);
    }
  });

  return router;
};

function runBasicAudit(domain) {
  const issues = [];
  let score = 100;

  if (!domain.url.startsWith('https://')) {
    issues.push('Site is not using HTTPS');
    score -= 20;
  }

  if (!domain.url.includes('www.') && !domain.name.includes('www.')) {
    issues.push('No www subdomain detected');
    score -= 5;
  }

  return { score: Math.max(0, score), issues };
}
