# Suni verification map

This directory is the maintained source for verifying what Suni users see. Read this index, then use the matching feature file as the recipe.

## Baseline preconditions

- `$V up` printed `ready:` and `$V doctor` reports only `ok` lines. `V` is `.agents/skills/verify-suni/scripts/verify-suni.sh`, run from the repo root.
- The dev database is shared and already holds data. Name every record you create `Verify Suni <run id>` (`cat /tmp/verify-suni/state/run_id`) so it is unique and easy to find.
- Seeded users are admins. Admin-only behavior needs the admin, and user-role behavior needs a user created through [Users](./users.md).

## Driving conventions

- Run every browser action through `$V ab`, which pins the `verify-suni` session.
- Use roles, labels and visible text. Buttons rendered as links (`Nuevo Cliente`, `Nuevo proveedor`, `Editar`, `Cancelar`) expose `role=button`, not `link`.
- `find label` matches the label text without the required-field `*`. Snapshots show the accessible name with it (`textbox "RFC *"`).
- The sidebar sections `Ventas` and `Administración` are collapsed unless the current page is inside them. Click the section button before its links, or start from `/dashboard`, whose module cards are links with the same names.
- After a page-changing action, wait for text or a URL. Never sleep.
- After confirming a dialog, wait until `!document.querySelector("[role=dialog],[role=alertdialog]")` before the next click. The fade-out overlay otherwise catches it.
- Undo every mutation through the UI's reverse action. Never delete evidence.

## Proof and skip reporting

- For each step, capture the action and the resulting state with `$V shot <feature> <step>`.
- Confirm each mutation with a second view: the list or detail page, and `$V sql` for the row.
- Record the feature file and entry point used next to every artifact path.
- If a path cannot be reached, report the command you tried and the precondition that was missing. Do not report a skipped entry point as verified through another path.

## Feature entry contract

Each feature file has an H1, one paragraph about user-visible behavior, then exactly these H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with agent-browser` (starting with `Preconditions:`), and `Gotchas`.

## Features

- [Sign in](./sign-in.md) covers the magic link request, the email in Mailpit, the session redirect, and the expired link page.
- [Customers](./customers.md) covers the list with search and status tabs, creating with the postal code lookup, the detail page, editing, archiving and unarchiving, and seller scoping.
- [Branches and contacts](./branches-contacts.md) covers creating branches and contacts under a customer, their list pages, the contact picker, and the archive cascade from the customer.
- [Suppliers](./suppliers.md) covers the supplier directory, its admin-only create, edit and archive, and the read-only view for non-admins.
- [Users](./users.md) covers the admin user list, the create dialog, editing, suspending and reactivating, impersonation, and the non-admin session.
