const { Router } = require('express');

module.exports = (prisma) => {
  const router = Router();

  // GET /api/audits?domainId=
  router.get('/', async (req, res, next) => {
    try {
      const where = req.query.domainId ? { domainId: Number(req.query.domainId) } : {};
      const audits = await prisma.audit.findMany({
        where,
        orderBy: { crawledAt: 'desc' },
        include: { domain: true },
      });
      res.json(audits);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/audits/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const audit = await prisma.audit.findUnique({
        where: { id: Number(req.params.id) },
        include: { domain: true },
      });
      if (!audit) return res.status(404).json({ error: 'Audit not found' });
      res.json(audit);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/audits
  router.post('/', async (req, res, next) => {
    try {
      const { domainId, score, issues } = req.body;
      const audit = await prisma.audit.create({
        data: { domainId: Number(domainId), score, issues },
      });
      res.status(201).json(audit);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/audits/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.audit.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
