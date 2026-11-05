---
name: verify-suni
description: Drive the real Suni web app (React at https://suni.localhost, API at https://api.suni.localhost) in a browser to prove a change works. Use after changing web routes, UI, oRPC procedures, auth, or emails, when lint and types are not enough. Launches the dev stack, signs in with a magic link read from Mailpit, drives features with agent-browser, and keeps screenshots and ARIA snapshots as evidence.
---

# Verify Suni

Every command runs from the repo root through one helper:

```bash
V=.agents/skills/verify-suni/scripts/verify-suni.sh
```

`$V` with no arguments prints its usage. State lives in `/tmp/verify-suni/state`, evidence in `/tmp/verify-suni/evidence/<run id>`. Set `VERIFY_SUNI_DIR` to move both.

## Launch

```bash
$V up
```

It starts the `docker-compose.dev.yml` services (Postgres, Mailpit, Garage) and waits until they are healthy. It refuses to continue if the `user`, `session`, `verification` or `customer` tables are missing. It runs the idempotent `db:seed`, which makes sure an admin exists. Then it starts `pnpm run dev` in the background and waits until the web answers and `GET <api>/api/auth/ok` responds. It prints the URLs, the admin email to sign in with, and the evidence directory.

Ready means `$V up` printed `ready:`. The dev log is at `/tmp/verify-suni/state/dev.log`.

- Never run `db:push`, `db:generate` or `db:migrate`. Missing tables are the user's call. Stop and ask.
- Portless serves the HTTPS URLs on port 443 with its own trusted CA. If `pnpm exec portless doctor` reports failures, the user has to fix them (the first run needs sudo). `PORTLESS=0` is not supported here, because `.env.schema` points auth and CORS at the portless URLs.
- One instance per machine. The portless name `suni` and the dev database are shared, so `$V up` refuses when `https://suni.localhost` is served by a process it did not start. Never drive someone else's instance.

## Doctor

```bash
$V doctor
```

This check is read-only. It confirms that the dev server this run started is alive and that both portless routes belong to its process tree. It confirms that the web and the API answer, that the Postgres and Mailpit containers are healthy, that `agent-browser` is installed, and that the admin email is known. Run it first whenever anything looks off. Every line must say `ok`.

`agent-browser` missing: `npm i -g agent-browser && agent-browser install`.

## Drive

Sign in first:

```bash
$V login            # the seeded admin
$V login <email>    # any existing, active user
```

The helper clears that recipient's Mailpit inbox. It submits the sign-in form, reads the magic link from the email (subject `Enlace de acceso - Suni`), opens it in the browser, and waits for `/dashboard`. The browser session is named `verify-suni` and keeps its cookies until `$V down`.

Then drive with agent-browser through the helper, so every command hits the same session:

```bash
$V ab snapshot -i                                   # interactive elements with @eN refs
$V ab find role link click --name "Clientes"        # sidebar
$V ab find role button click --name "Nuevo Cliente" # navigating buttons are role=button
$V ab find label "Razón social" fill "Acme"         # label text, without the * of required fields
$V ab wait --text "Gestiona los clientes del sistema"
$V ab get url
```

Run `agent-browser skills get core` once for the full command set. Prefer `find role`, `find label` and `wait --text` over refs in recipes. Refs change after every navigation.

Each feature's recipe is in [features/README.md](features/README.md). Drive every entry point the map lists for the feature you changed.

## Evidence

```bash
$V shot <feature> <step>   # full-page PNG plus URL and ARIA snapshot
$V sql "<query>"           # read-only check of stored state
$V evidence                # prints this run's evidence directory
```

`shot` writes `<evidence>/<feature>/<step>.png` and `<step>.aria.txt`. Report those paths.

Proof standards:

- Go through the real user path: sidebar, buttons and forms. Do not call `/rpc` directly or write to the database to set up the state under test.
- Capture the action and the result: the filled form before submitting, then the resulting page.
- Check side effects next to the screen. Use `$V sql` for rows, and Mailpit (`http://localhost:8025`) for emails.
- Cover the error and empty states the change touches, not only the happy path.
- The only external system is SEPOMEX (`VITE_SEPOMEX_URL`, the postal code lookup), and it is real. If it is down, the form falls back to manual address entry. Report that, do not mock it.

## Cleanup

```bash
$V down
```

It closes the `verify-suni` browser session and stops exactly the process tree `$V up` started (pnpm, turbo, portless, vite, bun). It leaves the Docker services running, because other work uses them (`pnpm run services:down` stops them, only on request). Evidence stays in `/tmp/verify-suni/evidence/`. Never kill by process name.

Data you created stays in the shared dev database. Undo it through the UI's reverse action (archive a customer, suspend a user) and say in the report which rows remain.

## Helpers

`scripts/verify-suni.sh` is the only helper. Its subcommands are `up`, `doctor`, `login [email]`, `ab <agent-browser args>`, `shot <feature> <step>`, `sql <query>`, `evidence` and `down`. It needs `docker`, `pnpm`, `jq`, `curl` and `agent-browser`.
