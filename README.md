# SRRU Student Activity Platform

Full-stack system for **student activity registration**, **QR-based attendance**, **hour aggregation** (regular vs special-track rules), **staff approvals**, **reports (Excel/PDF)**, and **admin analytics**, aligned with Surindra Rajabhat University co-curricular policy described in your research (Chapters 1–3).

## Repository layout

```
apps/
  api/          # NestJS + PostgreSQL + Prisma + Swagger (/api/docs)
  web/          # Next.js (App Router) + Tailwind CSS
docker-compose.yml
docs/           # Chapter 4–5 / architecture documentation
```

## Quick start (local)

1. **PostgreSQL** — create database `srru_activities` (or use Docker Compose).
2. **API** — copy `apps/api/.env.example` → `apps/api/.env`, set `DATABASE_URL` and `JWT_SECRET`.
3. From `apps/api`:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   npm run start:dev
   ```

   Open Swagger: `http://localhost:4000/api/docs`

4. **Web** — copy `apps/web/.env.example` → `apps/web/.env.local` (optional).

   ```bash
   npm run dev
   ```

   App: `http://localhost:3000`

## Docker

From the repository root:

```bash
docker compose up --build
```

- API: `http://localhost:4000/api`
- Web: `http://localhost:3000`
- Postgres: `localhost:5432`

After first API start, run seed inside the API container if you need demo users:

```bash
docker compose exec api npx prisma db seed
```

## Seed accounts (after `npm run db:seed`)

| Role        | Username      | Password    |
|------------|---------------|------------|
| Admin      | `admin`       | `Admin123!` |
| Coordinator| `coordinator` | `Coord123!` |
| Executive  | `executive`   | `Exec123!`  |
| Student    | `64100001`    | `Student123!` |

## Implementation note vs. thesis prototype

Your document describes an **MVC + PHP/Laravel + MySQL** prototype. This repository delivers a **production-oriented** stack (**Next.js + NestJS + PostgreSQL**) requested for deployment and scalability, while preserving the same domain rules (5 activity domains, core/elective nature, hour thresholds, QR workflow, credit transfer, amendments, certificates).

Further documentation: `docs/DISSERTATION_CHAPTER_4_5_SYSTEM_DESIGN.md`.
