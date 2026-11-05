# Users

User management (`Usuarios`) is admin-only, on the API and in the web app. An admin lists users, searches them by name or email, creates a user with a role (`Admin` or `Usuario`), edits them, and suspends or reactivates them. A new user signs in with the magic link from [Sign in](./sign-in.md).

## Sub-features

- `users-list` shows a table with the columns `Usuario`, `Correo`, `Rol` and `Estado`, plus `Cargando...`, `No se pudieron cargar los usuarios.` and `No se encontraron resultados.`.
- `users-search` filters by name or email.
- `users-create` creates a user with name, email and role.
- `users-edit` changes name, email or role.
- `users-status` suspends (`Suspender`) or reactivates (`Activar`) a user after a dialog. An admin cannot change their own status.
- `users-non-admin` covers what a user-role account sees.

## How to get to it (user POV)

- Sidebar link `Usuarios` goes to `/users`.
- The button `Nuevo Usuario` goes to `/users/new`.
- The row buttons `Editar` (`/users/<id>/edit`) and `Suspender` or `Activar`.

## Driving it with agent-browser

Preconditions:

- Signed in as the admin with `$V login`.
- `E="verify-$(cat /tmp/verify-suni/state/run_id)@suni.localhost"` matches no user.

- **Open list.** Run `$V ab find role link click --name "Usuarios"` and `$V ab wait --text "Administra los usuarios del sistema"`. The signed-in admin's row is marked `Tú`, and its `Suspender` button is disabled. Run `$V shot users list`.
- **Create.** Run `$V ab find role button click --name "Nuevo Usuario"`, `$V ab find label "Nombre" fill "Verify Suni"` and `$V ab find label "Correo" fill "$E"`. Pick the role with `$V ab find label "Rol del usuario" click`, `$V ab keyboard type "Usuario"` and `$V ab press Enter`. Run `$V shot users create-filled`, then `$V ab find role button click --name "Crear"`. The page returns to `/users`.
- **Stored row.** `$V sql "select name, role, banned from \"user\" where email = '$E'"` returns `Verify Suni | user | f`.
- **Search.** Run `$V ab find role textbox fill "$E" --name "Buscar por nombre o correo..."` and `$V ab wait --fn "document.querySelectorAll('tbody tr').length === 1"`. The one row shows `$E`, `Usuario` and `Activo`. Run `$V shot users created`.
- **Suspend.** Run `$V ab find role button click --name "Suspender"` and `$V ab wait --text "¿Quieres suspender el usuario de Verify Suni?"`. The dialog names `$E`. Run `$V shot users suspend-dialog`, then `$V ab find role button click --name "Suspender"` again to confirm. The row shows `Suspendido` and an `Activar` button, and `banned` becomes `t`. Run `$V shot users suspended`.
- **Reactivate.** Run `$V ab find role button click --name "Activar"`, `$V ab wait --text "¿Quieres activar el usuario de Verify Suni?"` and `$V ab find role button click --name "Activar"`. The row shows `Activo`, and `banned` returns to `f`. Run `$V shot users reactivated`.
- **Edit.** Run `$V ab find role button click --name "Editar"` and `$V ab wait --url "**/users/*/edit"`. The form is prefilled. Run `$V ab find label "Nombre" fill "Verify Suni Editado"` and `$V ab find role button click --name "Guardar"`. The page returns to `/users`, and the stored `name` is `Verify Suni Editado`.
- **Non-admin view.** Sign in as `$E` in a second browser session, so the admin session survives. Define `B() { agent-browser --session verify-suni-user "$@"; }`, request the link from `https://suni.localhost/`, read it from Mailpit as `magic_link` in the helper does, and open it with `B open "<link>"`. Then check three things.
  - The sidebar has no `Usuarios` link. `B open https://suni.localhost/users`, `/users/new` and `/users/<id>/edit` each end on `/dashboard` (`B wait --url "**/dashboard"`).
  - On `/customers`, cards have no `Vendedor` line.
  - On `/customers/new`, the only combobox is `Medio de adquisición`, so there is no `Tipo`.
  - Close that session with `B close` when done.

## Gotchas

- `apps/web/src/routes/_auth/users/route.tsx` redirects a non-admin to `/dashboard` before any `/users` page loads, and the sidebar hides `Usuarios` with `useIsAdmin`. Every `users.*` procedure except `me` is admin-only on the API either way.
- Search is debounced. Right after `fill`, the table still lists every user, and `find role button --name "Suspender"` clicks the first row's button. Wait until exactly one row is left before acting on a row.
- The confirm buttons in the dialogs share their names with the row buttons (`Suspender`, `Activar`). The open modal makes the row inert, so the second `find role button` hits the dialog.
- `Editar` and the status button are icon buttons. Their accessible names come from screen-reader-only text.
- There is no delete. Suspend leftover test users and report their emails.
