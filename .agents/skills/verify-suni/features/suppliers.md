# Suppliers

Suppliers (`Proveedores`) is a supplier directory in the sidebar's `Administración` section. Every signed-in user can list suppliers and open their detail pages. Only admins can create, edit, archive and unarchive, and only active suppliers can be edited. The form fills the address from the postal code, like the customer form.

## Sub-features

- `suppliers-list` shows cards with the tabs `Activos`, `Archivados` and `Todos`, a search on the business name (`?name=`), and loading, empty (`No hay proveedores para mostrar`) and error states.
- `suppliers-create` validates with the shared Zod schema, looks up the postal code, saves, and returns to the list.
- `suppliers-detail` shows the name, `RFC <rfc>`, `Dirección fiscal` and `Teléfono` (with `ext. N` when set), an `Archivado` badge when archived, and the tab `Datos generales` plus five disabled `Pronto` tabs.
- `suppliers-edit` changes a supplier and returns to its detail page.
- `suppliers-archive` archives and unarchives from the detail page, the card menu, or the archived card's footer.
- `suppliers-non-admin` shows the list and detail pages read-only.

## How to get to it (user POV)

- Sidebar section `Administración`, link `Proveedores`, goes to `/suppliers`. The dashboard also has a `Proveedores` module card.
- `Nuevo proveedor` (admins only) goes to `/suppliers/new`.
- A card's title link or `Ver detalles` goes to `/suppliers/<id>`. The card menu `Acciones de <name>` offers `Editar` and `Archivar`. An archived card has a footer button `Desarchivar <name>`.
- The detail page has `Editar` (`/suppliers/<id>/edit`) and `Archivar` or `Desarchivar` for admins.

## Driving it with agent-browser

Preconditions:

- Signed in with `$V login`.
- `SN="Proveedor Verify $(cat /tmp/verify-suni/state/run_id)"` matches no supplier.

- **Open list.** Run `$V ab find role button click --name "Administración"`, `$V ab find role link click --name "Proveedores"` and `$V ab wait --text "Consulta el directorio de proveedores"`. Run `$V shot suppliers list-empty` if there are none.
- **Invalid submit.** Run `$V ab find role button click --name "Nuevo proveedor"` and `$V ab wait --text "Registra un proveedor en el directorio"`. Run `$V ab find role button click --name "Crear"`. The alerts `La razón social es requerida`, `RFC inválido`, `Debe tener 10 dígitos`, `Debe tener 5 dígitos`, `La colonia es requerida`, `El municipio es requerido`, `El estado es requerido`, `La calle es requerida` and `El número exterior es requerido` appear. Run `$V shot suppliers create-errors`.
- **Create.** Fill `Razón social` with `$SN`, `RFC` with `pvs010101ab1`, `Teléfono` with `8111111111` and `Extensión` with `12`. `$V ab eval 'document.querySelector("#rfc").value'` is `PVS010101AB1`, because the field uppercases. Fill `Código postal` with `64000`, wait for `#city`, pick `Colonia` by typing `Monterrey Centro` and pressing `Enter`, and fill `Calle` and `Número exterior`. Run `$V shot suppliers create-filled`, then `$V ab find role button click --name "Crear"` and `$V ab wait --text "Proveedor creado"`. The page returns to `/suppliers`, and the card shows `PVS010101AB1`, `Monterrey Centro, Monterrey`, `Nuevo León · CP 64000` and `8111111111 ext. 12`.
- **Stored row.** `$V sql "select rfc, suburb, phone_extension, archived from supplier where name = '$SN'"` returns `PVS010101AB1 | Monterrey Centro | 12 |`.
- **Detail.** Run `$V ab find role link click --name "Ver detalles"` and `$V ab wait --text "Dirección fiscal"`. Run `$V shot suppliers detail`.
- **Edit.** Run `$V ab find role button click --name "Editar"` and `$V ab wait --text "Editar proveedor"`. Change `Calle`, then `$V ab find role button click --name "Guardar"` and `$V ab wait --text "Proveedor actualizado"`. The page returns to the detail page with the new street.
- **Archive.** Run `$V ab find role button click --name "Archivar"` and `$V ab wait --text "Esto archivará al proveedor"`. The dialog title is `¿Quieres archivar al proveedor $SN?`. Confirm with `$V ab find role button click --name "Archivar"` and wait for `Proveedor archivado`. The page shows `Archivado`, `Editar` is gone, and the button is `Desarchivar`. Run `$V shot suppliers archived-detail`. Opening `/suppliers/<id>/edit` now ends on `/suppliers/<id>`.
- **Unarchive.** Open `/suppliers?status=archived`, run `$V ab find role button click --name "Desarchivar $SN"` and `$V ab wait --text "Esto restaurará al proveedor"`, then confirm with `$V ab find role button click --name "Desarchivar"`. Wait for `Proveedor desarchivado`; `archived is null` returns `t`. Run `$V shot suppliers unarchived`.
- **Card menu archive.** On `/suppliers`, run `$V ab find role button click --name "Acciones de $SN"`. The menu `Acciones` has `Editar` and `Archivar`. Archive through it so the run leaves the supplier archived.
- **Non-admin.** In a user-role session (see [Users](./users.md)), `/suppliers?status=all` lists the supplier but has no `Nuevo proveedor`, no `Acciones de` menu and no `Desarchivar` footer. The detail page has no `Editar`, `Archivar` or `Desarchivar`. `/suppliers/new` ends on `/suppliers`, and `/suppliers/<id>/edit` ends on `/suppliers/<id>`.

## Gotchas

- The `Administración` sidebar section is collapsed unless the current page is inside it. Click it before `find role link --name "Proveedores"`.
- The sidebar link is not admin-only; only the actions are. The API enforces it too: `create`, `update` and `setArchived` are admin procedures.
- The card menu button is named `Acciones de <name>`, not `Abrir menú` as on customer cards.
- The list always fetches every status and filters in the browser, so tab counts update without a refetch.
- `Colonia` is a react-select combobox; type and press `Enter`.
- The RFC must match `^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$` and is not unique.
- Suppliers stay in the shared database. Leave yours archived and report the names.
