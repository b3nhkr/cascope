const { Router } = require('express');

module.exports = (prisma) => {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const keywords = await prisma.keyword.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(keywords);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const keyword = await prisma.keyword.findUnique({
        where: { id: Number(req.params.id) },
        include: { rankings: true },
      });
      if (!keyword) return res.status(404).json({ error: 'Keyword not found' });
      res.json(keyword);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { phrase } = req.body;
      const keyword = await prisma.keyword.create({ data: { phrase } });
      res.status(201).json(keyword);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.keyword.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
