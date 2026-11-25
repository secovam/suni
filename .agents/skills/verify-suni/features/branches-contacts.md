# Branches and contacts

Branches (`Sucursales`) belong to a customer, and contacts (`Contactos`) belong to one branch of that customer. Both have list pages in the sidebar's `Ventas` section and appear as tabs on the customer detail page; contacts also appear on the branch detail page. Creating and editing happen in dialogs. Archiving a customer archives nothing in the database, but its branches and their contacts show and behave as archived until the customer is unarchived. A non-admin sees only the branches they created and the contacts under them.

## Sub-features

- `branches-list` lists branch cards at `/branches` with the tabs `Activas`, `Archivadas` and `Todas`, a `Buscar sucursal` search (`?name=`) and the `Filtrar por cliente` combobox (`?customerId=`).
- `branches-create` creates a branch from a customer's `Sucursales` tab, with the postal code lookup.
- `branches-detail` shows a branch at `/customers/<customerId>/branches/<branchId>` with `Editar`, `Archivar`, and the tabs `Información general` and `Contactos` plus three disabled `Pronto` tabs.
- `contacts-list` lists contact cards at `/contacts` with the tabs `Activos`, `Archivados` and `Todos` and a `Buscar contacto` search.
- `contacts-create` creates a contact from a branch's `Contactos` tab, or from `/contacts` through a customer and branch picker.
- `branches-contacts-archive` archives and unarchives from the card menu, an archived card's footer, or the branch header.
- `branches-contacts-cascade` shows children of an archived customer as `Archivada con el cliente` or `Archivado con el cliente`, with `Desarchivar` disabled.

## How to get to it (user POV)

- Sidebar section `Ventas`, links `Sucursales` (`/branches`) and `Contactos` (`/contacts`). The dashboard has module cards for both.
- On a customer detail page, the `Sucursales` tab (selected by default) has `Nueva Sucursal`, and the `Contactos` tab lists the customer's contacts.
- A branch card's `Ver detalles` goes to the branch detail page, whose `Contactos` tab has `Nuevo Contacto`.
- `Nueva Sucursal` on `/branches` and `Nuevo Contacto` on `/contacts` open a picker first.
- Card menus (`Abrir menú`, titled `Acciones`) offer `Editar` and `Archivar` or `Desarchivar`. Contacts have no detail page.

## Driving it with agent-browser

Preconditions:

- Signed in with `$V login`, on the detail page of an active customer you created in [Customers](./customers.md).
- `R=$(cat /tmp/verify-suni/state/run_id)`, `BN="Sucursal Verify $R"` and `CN="Contacto Verify $R"` match no rows.

- **Branch invalid submit.** Run `$V ab find role button click --name "Nueva Sucursal"` and `$V ab wait --text "Captura los datos de la nueva sucursal."`. Run `$V ab find role button click --name "Crear"`. The alerts `El nombre de la sucursal es requerido`, `Debe tener 5 dígitos`, `La colonia es requerida`, `El municipio es requerido`, `El estado es requerido`, `La calle es requerida` and `El número exterior es requerido` appear.
- **Branch create.** Run `$V ab find label "Nombre de la sucursal" fill "$BN"` and `$V ab find label "Código postal" fill "64000"`, then `$V ab wait --fn '[...document.querySelectorAll("[role=dialog] input")].some(i=>i.value==="Monterrey")'`. Pick `Colonia` by typing `Monterrey Centro` and pressing `Enter`. Fill `Calle` and `Número exterior`. Run `$V shot branches create-filled`, then `$V ab find role button click --name "Crear"` and `$V ab wait --text "Sucursal creada"`. The tab shows `Activas 1` and a card with `$BN` and `..., Col. Monterrey Centro`. Run `$V shot branches created`.
- **Branch row.** `$V sql "select b.suburb, b.seller_id = c.seller_id from customer_branches b join customer c on c.id = b.customer_id where b.name = '$BN'"` returns `Monterrey Centro | t` when the customer's seller created the branch.
- **Branch detail.** Run `$V ab find role link click --name "Ver detalles"` and `$V ab wait --url "**/branches/*"`. The header has `Editar` and `Archivar`, and the tabs are `Información general`, `Contactos` and the disabled `Cotizaciones`, `Archivos` and `Requerimientos Técnicos`.
- **Contact create.** Run `$V ab find role tab click --name "Contactos"`, `$V ab find role button click --name "Nuevo Contacto"` and `$V ab wait --text "Nuevo contacto"`. Submitting empty shows `El nombre es requerido` and `Correo inválido`. Fill `Nombre` with `$CN`, `Correo` with `contacto-$R@suni.localhost` and `Puesto` with `Gerente`. Run `$V shot contacts create-filled`, then `$V ab find role button click --name "Crear"` and `$V ab wait --text "Contacto creado"`. Run `$V shot contacts created`. `$V sql "select position, branch_id is not null from contact where name = '$CN'"` returns `Gerente | t`.
- **Branch list.** Run `$V ab find role link click --name "Sucursales"` and `$V ab wait --text "Gestiona las sucursales de los clientes"`. Run `$V ab find label "Buscar sucursal" fill "zzz"`. The URL gains `?name=zzz`, and `No se encontraron sucursales` and `Intenta con otros filtros de búsqueda` appear. Run `$V shot branches empty-filter`, then `$V ab find role button click --name "Limpiar búsqueda"`.
- **Contact list and picker.** Run `$V ab find role link click --name "Contactos"` and `$V ab wait --text "Gestiona los contactos de las sucursales"`. The card shows `$CN`, `Gerente`, the customer and the branch. Run `$V ab find role button click --name "Nuevo Contacto"` and `$V ab wait --text "Selecciona a dónde pertenecerá el contacto."`. `Continuar` is disabled until a customer and a branch are picked. Run `$V shot contacts picker` and close it with `$V ab press Escape`.
- **Cascade.** Archive the customer from its detail page (see [Customers](./customers.md)). Its `Sucursales` tab shows `Archivadas 1` and the card `Archivada con el cliente`. On `/contacts`, run `$V ab find role tab click --name "Archivados 1"`; the card reads `Archivado con el cliente`, and its menu has a disabled `Desarchivar` with the hint `Desarchiva primero el cliente`. Run `$V shot contacts cascade`. `$V sql` shows the branch and contact rows still have `archived is null`.

## Gotchas

- Children of an archived customer are archived only on screen; the API also refuses to create, edit or change the status of anything under an archived parent. An archived branch does the same to its contacts (`Archivado con la sucursal`).
- A branch's `seller_id` is the user who created it, not the customer's seller. If an admin creates a branch on a seller's customer, that seller does not see it.
- The `Colonia` field and the picker selects are react-select comboboxes. Type and press `Enter`. The picker's two comboboxes have no accessible name, so reach them by order or by their placeholders `Selecciona un cliente` and `Selecciona una sucursal`.
- Inside a dialog, `find label "Código postal"` and the other address labels match the dialog's fields, because the page behind it is inert.
- Tab names include their count (`Archivados 1`). On the customer and branch detail pages the status choice is a radio group labelled `Estado` instead.
- `Ver imagen completa` and `Cambiar foto` on the branch detail page do nothing yet.
- Created branches and contacts stay in the shared database. Leave the customer archived and report the names.
