# Users

User management (`Usuarios`) is admin-only on the API. An admin lists users, searches them by name or email, creates a user with a role (`Admin` or `Usuario`), edits them, and suspends or reactivates them. A new user signs in with the magic link from [Sign in](./sign-in.md).

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

- **Open list.** Run `$V ab find role link click --name "Usuarios"` and `$V ab wait --text "Administra los usuarios del sistema"`. The signed-in admin's row is marked `Tú`, and its status button is disabled. Run `$V shot users list`.
- **Create.** Run `$V ab find role button click --name "Nuevo Usuario"`, `$V ab find label "Nombre" fill "Verify Suni"` and `$V ab find label "Correo" fill "$E"`. Then pick the role by keyboard with `$V ab find label "Rol del usuario" click`, `$V ab keyboard type "Usuario"` and `$V ab press Enter`, and run `$V ab find role button click --name "Crear"`. Back on the list, `$V ab find role textbox fill "$E" --name "Buscar por nombre o correo..."` shows one row with `Usuario` and `Activo`. Run `$V shot users created`.
- **Stored row.** `$V sql "select role, banned from \"user\" where email = '$E'"` returns `user | f`.
- **Suspend.** In that row, run `$V ab find role button click --name "Suspender"`. A dialog asks `¿Quieres suspender el usuario de Verify Suni?`. Confirm with the dialog's `Suspender`. The row shows the suspended status, and `banned` becomes `t`.
- **Reactivate.** Run `$V ab find role button click --name "Activar"` and confirm. `banned` returns to `f`.
- **Non-admin view.** Run `$V down`, `$V up` and `$V login "$E"`. Check what `Usuarios` shows to this user, and that `Clientes` hides `Tipo` and the seller line.

## Gotchas

- The sidebar shows `Usuarios` to every signed-in user, while every `users.*` procedure except `me` is admin-only. From the code, a user-role account that opens `/users` should get `No se pudieron cargar los usuarios.` instead of a hidden link. This has not been driven yet. Report what you see. Access scoping is pending per `AGENTS.md`.
- Search is debounced. Wait for the row text, not a fixed time.
- `Editar` and the status button are icon buttons. Their accessible names come from screen-reader-only text.
- There is no delete. Suspend leftover test users and report their emails.
- Only the list and the `/users/new` form handles have been driven so far. Run the create, status and non-admin steps once and fix this file where it is wrong.
