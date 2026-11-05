---
name: test-suni-app
description: Verify a change in the real Suni app. Use after changing web routes, UI, API procedures, auth, or emails, when you must see the behavior working in a browser, not just pass lint and types. Covers starting services, signing in with a magic link from Mailpit, and capturing screenshots as evidence.
---

# Test Suni in the real app

Type checks and lint do not prove behavior. Drive the running app and keep screenshots as evidence.

## 1. Start the services

```bash
pnpm run services:up
```

Starts Postgres (`:5432`), Mailpit (SMTP `:1025`, UI and API `:8025`) and Garage (S3 `:3900`) from `docker-compose.dev.yml`. Skip it if `docker ps` already shows `suni-dev-*` containers.

## 2. Database

Read [packages/db/AGENTS.md](../../../packages/db/AGENTS.md) first. Never run `db:push` or `db:generate`. Applying migrations (`pnpm run db:migrate`) is the user's call per [docs/agents/testing.md](../../../docs/agents/testing.md), so if tables are missing, ask.

The seed (`pnpm run db:seed`) is idempotent. It creates one user with the `admin` role, or promotes the existing one, using `ADMIN_EMAIL` and `ADMIN_NAME`. Their development defaults in `.env.schema` are `suni@localhost.com` and `Suni`. A local `.env` can override them, so use the value the seed prints.

## 3. Start the app

```bash
pnpm run dev
```

Run it in the background and keep its PID so you can kill exactly that process when done.

| What | URL |
| --- | --- |
| Web | https://suni.localhost |
| API | https://api.suni.localhost |
| Mailpit UI and API | http://localhost:8025 |

Portless serves the HTTPS URLs and trusts its own local CA (the first run asks for sudo). To bypass it, run `PORTLESS=0 pnpm run dev`: web on `:3001`, API on `:3000`. Both come from the README.

## 4. Sign in with a magic link

There are no passwords. Sign-up is disabled, and the email is only sent when the user already exists.

1. Open the web URL and submit the seeded user's email in the sign-in form.
2. Read the email from Mailpit. In the UI at `http://localhost:8025`, or by API: `GET http://localhost:8025/api/v1/messages` lists messages, `GET http://localhost:8025/api/v1/message/latest` returns the newest one (404 when the inbox is empty), and `GET http://localhost:8025/api/v1/search?query=to:<email>` filters by recipient. The subject is `Enlace de acceso - Suni`.
3. Open the link from the message body in the same browser session. It expires after 15 minutes. A signed-in session redirects `/` to `/dashboard`.

Seeded users are admins. To check what a non-admin sees, create a user from the admin users page and sign in as them.

## 5. Drive the browser

Use the `agent-browser` skill: open the web URL, sign in as above, exercise the changed flow, and save screenshots as you go. Save them outside tracked files (for example the OS temp dir) and report their paths. Cover the empty, error and loading states the change touches, not only the happy path.

## 6. Clean up

Kill the dev server by the PID you captured. Leave `services:up` containers running unless the user asks to stop them (`pnpm run services:down`).
