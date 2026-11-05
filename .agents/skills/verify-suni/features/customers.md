# Customers

Customers (`Clientes`) is the reference domain module. A signed-in user lists customers and filters them by name, type and status. They create a customer with an address filled from the postal code, open its detail page, edit it, and archive or unarchive it. There is no delete.

## Sub-features

- `customers-list` shows active customers as cards, with loading, empty and error states.
- `customers-filter` filters by name (`?name=`, accents ignored), type (`?type=`) and status (`?status=active|archived|all`).
- `customers-create` validates with the shared Zod schema, looks up the postal code, saves, and opens the detail page.
- `customers-detail` shows the name, RFC, type, acquisition, seller (admins only), address and phone.
- `customers-edit` changes a customer and returns to its detail page.
- `customers-archive` archives from the card menu after a confirmation dialog, and unarchives the same way.

## How to get to it (user POV)

- Sidebar link `Clientes` goes to `/customers`.
- On the list, the button `Nuevo Cliente` goes to `/customers/new`.
- A card's title link or `Ver detalles` goes to `/customers/<id>`.
- The card menu `Abrir menú` offers `Editar` (`/customers/<id>/edit`) and `Archivar` or `Desarchivar`. The detail page has an `Editar` button.

## Driving it with agent-browser

Preconditions:

- Signed in with `$V login`.
- `N="Verify Suni $(cat /tmp/verify-suni/state/run_id)"` matches no customer.

- **Open list.** Run `$V ab find role link click --name "Clientes"` and `$V ab wait --text "Gestiona los clientes del sistema"`. Run `$V shot customers list-before`.
- **Invalid submit.** Run `$V ab find role button click --name "Nuevo Cliente"`, `$V ab wait --text "Crea un nuevo cliente"` and `$V ab find role button click --name "Crear"`. The alerts `La razón social es requerida`, `RFC inválido`, `Debe tener 10 dígitos` and `Selecciona un medio de adquisición` appear, and the URL stays `/customers/new`. Run `$V shot customers create-errors`.
- **General data.** Run `$V ab find label "Razón social" fill "$N"`, `$V ab find label "RFC" fill "VSU010101AB1"` and `$V ab find label "Teléfono" fill "8112345678"`. Then pick the acquisition channel by keyboard: `$V ab find label "Medio de adquisición" click`, `$V ab keyboard type "Página web"` and `$V ab press Enter`.
- **Postal code lookup.** Run `$V ab find label "Código postal" fill "64000"` and `$V ab wait --fn 'document.querySelector("#city")?.value !== ""'`. `Municipio` is `Monterrey`, `Estado` is `Nuevo León`, both read-only, and a `Colonia *` combobox appears. Run `$V ab find label "Colonia" click`, `$V ab keyboard type "Monterrey Centro"` and `$V ab press Enter`.
- **Street.** Run `$V ab find label "Calle" fill "Av. Constitución"` and `$V ab find label "Número exterior" fill "100"`. Run `$V shot customers create-filled`.
- **Save.** Run `$V ab find role button click --name "Crear"` and `$V ab wait --text "VSU010101AB1"`. `$V ab get url` is `/customers/<uuid>`, and the page shows `$N`, `Cliente`, `Página web` and `Av. Constitución, No. Ext. 100, Colonia Monterrey Centro`. Run `$V shot customers create-detail`.
- **Stored row.** `$V sql "select count(*), max(postal_code), max(suburb) from customer where name = '$N'"` returns `1 | 64000 | Monterrey Centro`.
- **Filter.** Run `$V ab find role link click --name "Clientes"` and `$V ab find label "Buscar por nombre" fill "$N"`. The URL gains `?name=` and exactly one card has the heading `$N`. Run `$V shot customers list-after`.
- **Archive.** Run `$V ab find role button click --name "Abrir menú"`, `$V ab find role menuitem click --name "Archivar"` and `$V ab wait --text "Esto archivará"`. Run `$V shot customers archive-dialog`, then `$V ab find role button click --name "Archivar"`. With the name filter still applied, `No se encontraron clientes` appears. `$V sql "select archived is not null from customer where name = '$N'"` returns `t`.
- **Unarchive.** Open `Filtrar por estado` and choose `Clientes archivados`. On that card, `Abrir menú` offers `Desarchivar` and no `Editar`.
- **Empty state.** Filter by a name that matches nothing. `No se encontraron clientes` and `Intenta con otros filtros de búsqueda` appear.

## Gotchas

- `Medio de adquisición`, `Tipo` and `Colonia` are react-select comboboxes. Pick options by typing and pressing `Enter`. `find role option click` can report success without selecting anything, and then `Crear` silently stays on `/customers/new` with `Selecciona un medio de adquisición`. Always assert that the URL left `/customers/new`.
- The postal code lookup calls the real SEPOMEX service. On a miss or an error, the status says `No encontramos ese código postal` or `No se pudo consultar el código postal`, and `Municipio` and `Estado` unlock for manual entry.
- `Tipo` only renders for admins. A user-role customer always gets `Cliente`, and the seller line on cards only appears for admins.
- The RFC must match `^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$` and is not unique, so reusing `VSU010101AB1` is fine.
- Card menus are hidden until hover on pointer devices. `find role button --name "Abrir menú"` still reaches them. With several cards, filter by name first so only one menu matches.
- Archived customers stay in the shared database. Report the names you left.
- The unarchive, edit and empty-state steps come from the code and have not been driven yet. Fix this file where they turn out wrong.
