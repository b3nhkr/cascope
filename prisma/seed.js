const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const domain = await prisma.domain.upsert({
    where: { name: 'example.com' },
    update: {},
    create: { name: 'example.com', url: 'https://example.com' },
  });

  const keyword = await prisma.keyword.upsert({
    where: { phrase: 'seo agency near me' },
    update: {},
    create: { phrase: 'seo agency near me' },
  });

  const city = await prisma.city.upsert({
    where: { name_state_country: { name: 'Austin', state: 'TX', country: 'US' } },
    update: {},
    create: { name: 'Austin', state: 'TX', country: 'US' },
  });

  await prisma.audit.create({
    data: { domainId: domain.id, score: 87.5, issues: JSON.stringify(['missing meta description', 'slow LCP']) },
  });

  await prisma.ranking.create({
    data: { domainId: domain.id, keywordId: keyword.id, cityId: city.id, position: 4, url: 'https://example.com/seo' },
  });

  console.log('Seeded:', { domain, keyword, city });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
