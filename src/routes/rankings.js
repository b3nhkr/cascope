const { Router } = require('express');

module.exports = (prisma) => {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const where = {};
      if (req.query.domainId) where.domainId = Number(req.query.domainId);
      if (req.query.keywordId) where.keywordId = Number(req.query.keywordId);
      if (req.query.cityId) where.cityId = Number(req.query.cityId);

      const rankings = await prisma.ranking.findMany({
        where,
        orderBy: { checkedAt: 'desc' },
        include: { domain: true, keyword: true, city: true },
      });
      res.json(rankings);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const ranking = await prisma.ranking.findUnique({
        where: { id: Number(req.params.id) },
        include: { domain: true, keyword: true, city: true },
      });
      if (!ranking) return res.status(404).json({ error: 'Ranking not found' });
      res.json(ranking);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { domainId, keywordId, cityId, position, url } = req.body;
      const ranking = await prisma.ranking.create({
        data: {
          domainId: Number(domainId),
          keywordId: Number(keywordId),
          cityId: Number(cityId),
          position,
          url,
        },
        include: { domain: true, keyword: true, city: true },
      });
      res.status(201).json(ranking);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.ranking.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
