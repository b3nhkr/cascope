# cascope

SEO rank tracking and audit platform.

## Stack

- **Backend**: Node.js + Express
- **Database**: SQLite via Prisma ORM (swap to PostgreSQL for production)
- **Frontend**: React (in `/frontend`)

## Setup

```bash
cp .env.example .env

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/domains` | List all domains |
| GET | `/api/domains/:id` | Get domain with audits & rankings |
| POST | `/api/domains` | Create domain `{ name, url }` |
| PUT | `/api/domains/:id` | Update domain |
| DELETE | `/api/domains/:id` | Delete domain |
| GET | `/api/audits` | List audits (filter: `?domainId=`) |
| GET | `/api/audits/:id` | Get audit |
| POST | `/api/audits` | Create audit `{ domainId, score, issues }` |
| DELETE | `/api/audits/:id` | Delete audit |
| POST | `/api/audit-client` | Trigger audit for a domain `{ domainId or domainName }` |
| GET | `/api/keywords` | List keywords |
| POST | `/api/keywords` | Create keyword `{ phrase }` |
| GET | `/api/cities` | List cities |
| POST | `/api/cities` | Create city `{ name, state, country }` |
| GET | `/api/rankings` | List rankings (filter: `?domainId=&keywordId=&cityId=`) |
| POST | `/api/rankings` | Create ranking `{ domainId, keywordId, cityId, position, url }` |

## Data Models

- **Domain** — tracked website (`name`, `url`)
- **Audit** — snapshot of SEO score/issues for a domain
- **Keyword** — search phrase being tracked
- **City** — geographic target (`name`, `state`, `country`)
- **Ranking** — domain position for a keyword in a city
