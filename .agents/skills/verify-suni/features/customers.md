# Customers

Customers (`Clientes`) is the reference domain module, in the sidebar's `Ventas` section. A signed-in user lists customers as cards, searches them by name and switches status tabs. They create a customer with an address filled from the postal code, open its detail page, edit it, and archive or unarchive it. There is no delete. A non-admin sees only the customers whose seller they are. Branches and contacts live under a customer; see [Branches and contacts](./branches-contacts.md).

## Sub-features

- `customers-list` shows cards in the status tabs `Activos`, `Archivados` and `Todos`, each with a count, plus loading, empty (`No hay clientes para mostrar`) and error states.
- `customers-filter` searches by name (`?name=`, accents and case ignored) and switches status (`?status=archived|all`; the default `active` is not in the URL).
- `customers-create` validates with the shared Zod schema, looks up the postal code, saves, and opens the detail page.
- `customers-detail` shows the name, the RFC under it, `Dirección fiscal`, `Teléfono`, `Medio de adquisición` and `Vendedor` (admins only), the `Editar` and `Archivar` buttons, and the tabs `Sucursales`, `Contactos` and four disabled `Pronto` tabs.
- `customers-edit` changes a customer and returns to its detail page. Archived customers cannot be edited.
- `customers-archive` archives or unarchives from the card menu, the archived card's footer, or the detail page, after a confirmation dialog.
- `customers-scope` keeps a non-admin to their own customers: other customers are missing from the list, and their detail URL shows `No se pudo cargar el cliente.`.

## How to get to it (user POV)

- Sidebar section `Ventas`, link `Clientes`, goes to `/customers`. The dashboard also has a `Clientes` module card.
- On the list, the button `Nuevo Cliente` goes to `/customers/new`.
- A card's title link or `Ver detalles` goes to `/customers/<id>`. Ids are 24-character cuid2 strings.
- The card menu `Abrir menú` offers `Editar` (`/customers/<id>/edit`) and `Archivar` on active cards, and only `Desarchivar` on archived ones. An archived card also has a footer button `Desarchivar <name>`.
- The detail page has the buttons `Editar` and `Archivar` (or `Desarchivar`).

## Driving it with agent-browser

Preconditions:

- Signed in with `$V login`.
- `N="Verify Suni $(cat /tmp/verify-suni/state/run_id)"` matches no customer.

- **Open list.** From `/dashboard`, run `$V ab find role link click --name "Clientes"` and `$V ab wait --text "Gestiona los clientes del sistema"`. From a page outside `Ventas`, run `$V ab find role button click --name "Ventas"` first. Run `$V shot customers list-before`.
- **Invalid submit.** Run `$V ab find role button click --name "Nuevo Cliente"`, `$V ab wait --text "Crea un nuevo cliente"` and `$V ab find role button click --name "Crear"`. Ten alerts appear: `La razón social es requerida`, `RFC inválido`, `Debe tener 10 dígitos`, `Selecciona un medio de adquisición`, `Debe tener 5 dígitos`, `La colonia es requerida`, `El municipio es requerido`, `El estado es requerido`, `La calle es requerida` and `El número exterior es requerido`. The URL stays `/customers/new`. Run `$V shot customers create-errors`.
- **General data.** Run `$V ab find label "Razón social" fill "$N"`, `$V ab find label "RFC" fill "VSU010101AB1"` and `$V ab find label "Teléfono" fill "8112345678"`. Then pick the acquisition channel by keyboard: `$V ab find label "Medio de adquisición" click`, `$V ab keyboard type "Página web"` and `$V ab press Enter`.
- **Postal code lookup.** Run `$V ab find label "Código postal" fill "64000"` and `$V ab wait --fn 'document.querySelector("#city")?.value !== ""'`. `Municipio` is `Monterrey`, `Estado` is `Nuevo León`, both read-only, and `Colonia` becomes a combobox. Run `$V ab find label "Colonia" click`, `$V ab keyboard type "Monterrey Centro"` and `$V ab press Enter`.
- **Street.** Run `$V ab find label "Calle" fill "Av. Constitución"` and `$V ab find label "Número exterior" fill "100"`. Run `$V shot customers create-filled`.
- **Save.** Run `$V ab find role button click --name "Crear"` and `$V ab wait --text "VSU010101AB1"`. `$V ab get url` is `/customers/<id>`, and the page shows `$N`, `Página web`, `Av. Constitución, No. Ext. 100, Colonia Monterrey Centro` and `Monterrey, Nuevo León, CP 64000`. Run `$V shot customers create-detail`.
- **Stored row.** `$V sql "select count(*), max(postal_code), max(suburb) from customer where name = '$N'"` returns `1 | 64000 | Monterrey Centro`.
- **Edit.** On the detail page, run `$V ab find role button click --name "Editar"` and `$V ab wait --url "**/edit"`. The form is prefilled. Run `$V ab find label "Teléfono" fill "8187654321"` and `$V ab find role button click --name "Guardar"`. The page returns to `/customers/<id>` and shows `8187654321`. The stored row has the new phone and keeps `suburb` and `acquisition`. Run `$V shot customers edit-done`.
- **Search and card menu.** Run `$V ab find role link click --name "Clientes"` and `$V ab find label "Buscar por nombre" fill "$N"`. The URL gains `?name=` and one card has the heading `$N`. `$V ab find role button click --name "Abrir menú"` opens a menu titled `Acciones` with `Editar` and `Archivar`.
- **Archive.** Run `$V ab find role menuitem click --name "Archivar"` and `$V ab wait --text "Esto archivará"`. The dialog title is `¿Quieres archivar al cliente $N?`. Run `$V shot customers archive-dialog`, then `$V ab find role button click --name "Archivar"`. With the search still applied, the `Activos` tab shows `No se encontraron clientes` and `Intenta con otros filtros de búsqueda`. `$V sql "select archived is not null from customer where name = '$N'"` returns `t`.
- **Unarchive.** Run `$V ab find role tab click --name "Archivados 1"` and `$V ab wait --url "**status=archived*"`. The card shows `Archivado` and a footer button `Desarchivar $N`, and its menu holds only `Desarchivar`. Run `$V ab find role menuitem click --name "Desarchivar"` after opening the menu, or `$V ab find role button click --name "Desarchivar $N"`. Wait for `Esto restaurará`, run `$V shot customers unarchive-dialog`, and confirm with `$V ab find role button click --name "Desarchivar"`. The archived tab becomes `No se encontraron clientes`, and `archived is null` returns `t`.
- **Archived detail.** Open the detail page and archive with the `Archivar` button. The banner `Este cliente está archivado. Desarchívalo para editarlo o agregarle sucursales y contactos.` appears, `Editar` and `Nueva Sucursal` disappear, and the button becomes `Desarchivar`. Run `$V shot customers archived-detail`. Leave it archived at the end of the run.
- **Non-admin.** Sign in as a user-role account in a second session (see [Users](./users.md)). The admin's customers are missing from `/customers?status=all`, and their detail URL shows `No se pudo cargar el cliente.`. A customer that account creates is listed, and its card and detail page have no `Vendedor`. `$V sql` shows its `seller_id` is that user. Archive it before closing the session.

## Gotchas

- `Medio de adquisición` and `Colonia` are react-select comboboxes. Pick options by typing and pressing `Enter`. `find role option click` can report success without selecting anything, and then `Crear` silently stays on `/customers/new` with `Selecciona un medio de adquisición`. Always assert that the URL left `/customers/new`.
- Before the postal code lookup, `Colonia` is disabled and `Municipio` and `Estado` read `Se llena con el código postal`, so `snapshot -i` shows `Medio de adquisición *` as the only combobox.
- The postal code lookup calls the real SEPOMEX service. On a miss or an error, the status says `No encontramos ese código postal` or `No se pudo consultar el código postal`, and `Municipio` and `Estado` unlock for manual entry.
- The `Ventas` sidebar section is collapsed unless the current page is inside it. From `/users` or `/suppliers`, `find role link --name "Clientes"` finds nothing until you click `Ventas`.
- The seller line on cards (`Vendedor:`) and in the detail page (`Vendedor`, a link to the user) only appears for admins.
- The RFC must match `^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$` and is not unique, so reusing `VSU010101AB1` is fine.
- Card menus are hidden until hover on pointer devices. `find role button --name "Abrir menú"` still reaches them. With several cards, search by name first so only one menu matches.
- The name search is bound to `?name=`. A second `fill` appends to the current value instead of replacing it. Click `Limpiar búsqueda` first; it only renders while the search has text. There is no other clear button.
- `Editar` is a `button` both on the detail page and as a `menuitem` in a card's menu, never a `link`.
- Tab names include their count (`Archivados 1`). `find role tab --name` needs the full name.
- Archiving a customer writes nothing to its branches and contacts; they show as archived with it. See [Branches and contacts](./branches-contacts.md).
- Archived customers stay in the shared database. Report the names you left.
