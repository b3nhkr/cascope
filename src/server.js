
const path = require('path');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const registerRoutes = require('./routes/index');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

registerRoutes(app, prisma);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const buildDir = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(buildDir));
app.get('*', (req, res) => res.sendFile(path.join(buildDir, 'index.html')));

app.listen(PORT, () => console.log(`cascope running on port ${PORT}`));

module.exports = app;
