# Users

User management (`Usuarios`) is admin-only, on the API and in the web app. An admin lists users, searches them by name or email, creates a user with a role (`Admin` or `Usuario`) in a dialog, edits them, suspends or reactivates them, and can impersonate a non-admin user. A new user signs in with the magic link from [Sign in](./sign-in.md).

## Sub-features

- `users-list` shows a table with the columns `Usuario`, `Correo`, `Rol` and `Estado`, plus `Cargando...`, `No se pudieron cargar los usuarios.`, `No se encontraron resultados.` and a pager (`Anterior`, `Siguiente`).
- `users-search` filters by name or email.
- `users-create` creates a user with name, email and role in the `Nuevo usuario` dialog.
- `users-edit` changes name, email or role on `/users/<id>/edit`.
- `users-status` suspends (`Suspender`) or reactivates (`Activar`) a user after a dialog. An admin cannot change their own status.
- `users-impersonate` signs the admin in as a non-admin user (`Suplantar`) until they click `Volver a mi cuenta`.
- `users-non-admin` covers what a user-role account sees.

## How to get to it (user POV)

- Top-level sidebar link `Usuarios` (admins only), right below `Inicio`, goes to `/users`. The dashboard also has a `Usuarios` module card.
- The button `Nuevo Usuario` opens a dialog on `/users`. There is no `/users/new` page; for an admin it renders `Not Found`.
- Each row has the icon buttons `Editar` (`/users/<id>/edit`), `Suplantar`, and `Suspender` or `Activar`.

## Driving it with agent-browser

Preconditions:

- Signed in as the admin with `$V login`.
- `E="verify-$(cat /tmp/verify-suni/state/run_id)@suni.localhost"` matches no user.

- **Open list.** Run `$V ab find role link click --name "Usuarios"` and `$V ab wait --text "Administra los usuarios del sistema"`. The signed-in admin's row is marked `Tú`. Its status button is disabled and named `No puedes cambiar tu propio estado`, and its impersonate button is disabled and named `No puedes suplantarte a ti mismo`. Run `$V shot users list`.
- **Create.** Run `$V ab find role button click --name "Nuevo Usuario"` and `$V ab wait --text "Captura los datos del nuevo usuario."`. Run `$V ab find label "Nombre" fill "Verify Suni"` and `$V ab find label "Correo" fill "$E"`. Pick the role with `$V ab find label "Rol del usuario" click`, `$V ab keyboard type "Usuario"` and `$V ab press Enter`. Run `$V shot users create-filled`, then `$V ab find role button click --name "Crear"` and `$V ab wait --text "Usuario creado"`. The dialog closes and the URL stays `/users`.
- **Stored row.** `$V sql "select name, role, banned from \"user\" where email = '$E'"` returns `Verify Suni | user | f`.
- **Search.** Run `$V ab find role textbox fill "$E" --name "Buscar por nombre o correo..."` and `$V ab wait --fn "document.querySelectorAll('tbody tr').length === 1"`. The one row shows `$E`, `Usuario` and `Activo`. Run `$V shot users created`.
- **Suspend.** Run `$V ab find role button click --name "Suspender"` and `$V ab wait --text "¿Quieres suspender el usuario de Verify Suni?"`. The dialog names `$E`. Run `$V shot users suspend-dialog`, then `$V ab find role button click --name "Suspender"` again to confirm. The row shows `Suspendido` and an `Activar` button, and `banned` becomes `t`. Run `$V shot users suspended`. This is the moment to drive the suspended path of [Sign in](./sign-in.md).
- **Reactivate.** Run `$V ab find role button click --name "Activar"`, `$V ab wait --text "¿Quieres activar el usuario de Verify Suni?"` and `$V ab find role button click --name "Activar"`. The toast `Usuario activado` appears, the row shows `Activo`, and `banned` returns to `f`. Run `$V shot users reactivated`.
- **Edit.** Run `$V ab wait --fn '!document.querySelector("[role=dialog],[role=alertdialog]")'` so the closing dialog no longer covers the row. Run `$V ab find role button click --name "Editar"` and `$V ab wait --url "**/users/*/edit"`. The heading is `Editar Usuario` and the form is prefilled. Run `$V ab find label "Nombre" fill "Verify Suni Editado"` and `$V ab find role button click --name "Guardar"`. The toast `Usuario actualizado` appears, the page returns to `/users`, and the stored `name` is `Verify Suni Editado`.
- **Impersonate.** Search `$E` again, then run `$V ab find role button click --name "Suplantar"` and `$V ab wait --text "Estás viendo la aplicación como"`. The page reloads on `/dashboard` as `$E`, with no `Usuarios` link. Run `$V shot users impersonating`, then `$V ab find role button click --name "Volver a mi cuenta"`. The page reloads on `/dashboard` as the admin, with `Usuarios` back.
- **Non-admin view.** Sign in as `$E` in a second browser session, so the admin session survives. Define `B() { agent-browser --session verify-suni-user "$@"; }`, request the link from `https://suni.localhost/`, read it from Mailpit as `magic_link` in the helper does, and open it with `B open "<link>"`. Then check:
  - The sidebar has `Inicio`, `Ventas` and `Administración` but no `Usuarios`. `B open https://suni.localhost/users`, `/users/new` and `/users/<id>/edit` each end on `/dashboard`.
  - Customer and supplier checks for this account are in [Customers](./customers.md), [Branches and contacts](./branches-contacts.md) and [Suppliers](./suppliers.md).
  - Close that session with `B close` when done.

## Gotchas

- `apps/web/src/routes/_auth/users/route.tsx` redirects a non-admin to `/dashboard` before any `/users` page loads, and the sidebar hides `Usuarios` with `useIsAdmin`. Every `users.*` procedure except `me` is admin-only on the API either way.
- After a dialog closes, its fade-out overlay still covers the page for a moment. A click right then fails with `is covered by <div...>`. Wait until no `dialog` or `alertdialog` is left before the next row action.
- A role change or a suspension reaches an open session on its next request, because the session is not cached in a cookie. A suspended user gets HTTP 401 and is sent to `/`.
- Search is debounced. Right after `fill`, the table still lists every user, and `find role button --name "Suspender"` clicks the first row's button. Wait until exactly one row is left before acting on a row.
- The confirm buttons in the dialogs share their names with the row buttons (`Suspender`, `Activar`). The open modal makes the row inert, so the second `find role button` hits the dialog.
- `Editar`, `Suplantar` and the status button are icon buttons. Their accessible names come from screen-reader-only text, which changes when they are disabled (`No puedes suplantar a un administrador` on other admins' rows).
- `Suplantar` and `Volver a mi cuenta` each do a full page reload to `/dashboard`.
- There is no delete. Suspend leftover test users and report their emails.
