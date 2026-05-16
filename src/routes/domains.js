const { Router } = require('express');

module.exports = (prisma) => {
  const router = Router();

  // GET /api/domains
  router.get('/', async (req, res, next) => {
    try {
      const domains = await prisma.domain.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(domains);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/domains/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const domain = await prisma.domain.findUnique({
        where: { id: Number(req.params.id) },
        include: { audits: true, rankings: true },
      });
      if (!domain) return res.status(404).json({ error: 'Domain not found' });
      res.json(domain);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/domains
  router.post('/', async (req, res, next) => {
    try {
      const { name, url } = req.body;
      const domain = await prisma.domain.create({ data: { name, url } });
      res.status(201).json(domain);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/domains/:id
  router.put('/:id', async (req, res, next) => {
    try {
      const { name, url } = req.body;
      const domain = await prisma.domain.update({
        where: { id: Number(req.params.id) },
        data: { name, url },
      });
      res.json(domain);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/domains/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.domain.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
