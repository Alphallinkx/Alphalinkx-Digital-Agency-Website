# Alphalinkx

Alphalinkx is a Next.js App Router site with a Prisma and SQLite backend for services, portfolio projects, testimonials, inquiries, and newsletter subscribers.

## Local development

Use Node.js 24 and npm.

```sh
npm ci
cp .env.example .env
npm run db:migrate
npm run db:seed -- --services-only
npm run dev
```

The site runs at [http://127.0.0.1:3000](http://127.0.0.1:3000). The optional full `npm run db:seed` command adds demonstration portfolio items, testimonials, and inquiries for local development.

To use `/admin`, generate a random `JWT_SECRET` with `openssl rand -hex 32` and put it in `.env`. Supply your admin credentials through the environment for `npm run db:admin` using `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The command creates the account or rotates the password for an existing account with that email. Use a unique password of at least 16 characters and at most 72 UTF-8 bytes. Rotating the password invalidates existing sessions for the account.

## Production

Run one Node.js instance with a persistent writable volume and an HTTPS reverse proxy. Keep the database and its backups outside the application checkout. This SQLite deployment requires persistent local storage. Vercel Functions and similar serverless platforms need a separate durable database integration before they can host the write endpoints.

1. Supply `DATABASE_URL` as an absolute SQLite file URL, for example `file:/var/lib/alphalinkx/site.db`. Set a unique `JWT_SECRET` of at least 32 bytes and set `APP_ORIGIN` to the public HTTPS origin with no trailing slash.
2. Run `npm ci`, `npm run build`, and `npm run db:migrate`. On a fresh database, run `npm run db:seed -- --services-only` to populate the service catalog. Import approved portfolio content and testimonials separately.
3. Provision an admin account using `npm run db:admin`. Supply the password to that provisioning command and keep it out of the application runtime environment.
4. Run `npm start` under your service manager. The default listener is `127.0.0.1:3000`. Use `--port` or `--hostname` after `npm start --` when the deployment needs a different bind address. Proxy HTTPS requests to the app and check `GET /api/health` for database readiness.
5. If the proxy overwrites a dedicated header with a single validated client IP, set `TRUSTED_CLIENT_IP_HEADER` to that header name. Without it, the app uses a shared fallback request bucket. The application limits run in memory, so configure any additional rate limits at the proxy.

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` and `AGENCY_NOTIFICATION_EMAIL` to enable notification and acknowledgement emails. The app saves inquiries when SMTP is disabled or delivery fails. Check live delivery with a test submission before launch.

Before publishing, confirm the homepage project and testimonial claims, office locations, contact address, and rights to the externally hosted showcase media. Sample content in the demo database requires the same review before importing it into production.

### Existing Prisma 6 SQLite data

Take a SQLite backup and verify that the existing schema matches the [initial migration](prisma/migrations/20261121000000_initial/migration.sql) before baselining. For the original included `prisma/dev.db` schema, point `DATABASE_URL` at the copy you intend to migrate, then run:

```sh
npx prisma migrate resolve --applied 20261121000000_initial
npm run db:migrate
```

The second migration adds the optional inquiry phone field and an index for duplicate detection. The SQLite adapter keeps the timestamp representation used by the original database. Rotate any admin credentials inherited from a development database before enabling access.

### Verification

`npm run typecheck` checks TypeScript and Next.js route types. `npm run build` generates Prisma Client and builds the production application. `npm audit --omit=dev` checks the runtime dependency tree.
