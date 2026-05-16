const { Router } = require('express');

module.exports = (prisma) => {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
      res.json(cities);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const city = await prisma.city.findUnique({
        where: { id: Number(req.params.id) },
        include: { rankings: true },
      });
      if (!city) return res.status(404).json({ error: 'City not found' });
      res.json(city);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { name, state, country } = req.body;
      const city = await prisma.city.create({ data: { name, state, country } });
      res.status(201).json(city);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.city.delete({ where: { id: Number(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
