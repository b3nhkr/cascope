const requireAuth = require('../middleware/auth');
const authRouter = require('./auth');
const domainsRouter = require('./domains');
const auditsRouter = require('./audits');
const keywordsRouter = require('./keywords');
const citiesRouter = require('./cities');
const rankingsRouter = require('./rankings');
const auditClientRouter = require('./auditClient');

module.exports = (app, prisma) => {
  app.use('/api/auth', authRouter(prisma));

  app.use('/api', requireAuth);

  app.use('/api/domains', domainsRouter(prisma));
  app.use('/api/audits', auditsRouter(prisma));
  app.use('/api/keywords', keywordsRouter(prisma));
  app.use('/api/cities', citiesRouter(prisma));
  app.use('/api/rankings', rankingsRouter(prisma));
  app.use('/api/audit-client', auditClientRouter(prisma));
};
