# Sign in

There are no passwords. A user enters their email, gets a magic link by email, and opening it signs them in and lands on `/dashboard`. Sign-up is disabled, so only existing users receive an email, suspended ones included. The page shows the same confirmation either way.

## Sub-features

- `signin-request` sends the magic link and shows the confirmation without reloading the page.
- `signin-invalid` rejects a malformed email inline.
- `signin-link` opens the link and lands on `/dashboard` with a session.
- `signin-redirect` sends a signed-in user from `/` to `/dashboard`, and a signed-out user from any `_auth` page to `/`.
- `signin-expired` shows the error page for an invalid, expired or already used link.
- `signin-suspended` sends a suspended user's link to the error page with the suspension message.

## How to get to it (user POV)

- Open `https://suni.localhost/`.
- Open any signed-in page while signed out. The guard redirects to `/`.
- Open the link in the email `Enlace de acceso - Suni`.

## Driving it with agent-browser

Preconditions:

- No session in the `verify-suni` browser (`$V down`, then `$V up`, gives a fresh one).
- The target email belongs to an existing user that is not suspended.

- **Whole flow.** Run `$V login`. It prints `signed in as <email> at https://suni.localhost/dashboard`. Then run `$V shot sign-in dashboard`.
- **Request step by hand.** Run `$V ab open https://suni.localhost/`, `$V ab find label "Inicia sesión con tu correo" fill "<email>"` and `$V ab find role button click --name "Enviar enlace mágico"`. `$V ab wait --text "Si existe una cuenta con este correo"` succeeds, the URL stays `https://suni.localhost/`, and `Enviar otro enlace` appears.
- **Email side effect.** `curl -s http://localhost:8025/api/v1/search --get --data-urlencode "query=to:<email>" | jq '.messages[0].Subject'` prints `"Enlace de acceso - Suni"`.
- **Unknown email.** Submit an address that has no user. The same confirmation appears, and the search above returns no message for it.
- **Malformed email.** Fill `not-an-email` and submit. The `alert` `Correo inválido` appears.
- **Redirect.** While signed in, run `$V ab open https://suni.localhost/` and `$V ab wait --url "**/dashboard"`.
- **Used link.** Sign in with a link, keep it, and open it again with `$V ab open "<link>"`. The browser lands on `/auth-error?error=INVALID_TOKEN` with the heading `No pudimos iniciar tu sesión`, the text `Este enlace de acceso venció o ya no es válido`, and the button `Volver a iniciar sesión`. With a session still active, that button leads to `/dashboard`.
- **Suspended user.** Suspend a test user from [Users](./users.md) and request their link. The confirmation is the same as for any other email, and the email still arrives. Opening it lands on `/auth-error?error=BANNED_USER` with the heading `No pudimos iniciar tu sesión` and the text `Tu acceso a Suni está suspendido`, and no session cookie is set.

## Gotchas

- `ADMIN_EMAIL` is a sensitive Varlock value, so the seed prints it masked. `$V up` reads the admin from the `user` table instead.
- The link expires after 15 minutes, and a link can be used only once. Opening it a second time goes through the used-link path above. Expiry by time has not been driven.
- Opening the link in another browser profile signs in that profile, not the `verify-suni` session.
- A suspended user (`banned`) gets the email on purpose, so the link can tell them their access is suspended. Better Auth's admin plugin rejects them inside the verify endpoint, and the `hooks.after` in `packages/auth/src/index.ts` turns that error into the redirect to `/auth-error`. Reactivate the user from [Users](./users.md) to sign in.
- `/sign-in/magic-link` allows 3 requests per minute per IP. A fourth request in that window never shows the confirmation, so wait about 20 seconds between requests in a script.
