import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import {
  purchaseCreateSchema,
  purchaseOrderItemSchema,
} from "@suni/db/validation/purchase-orders";
import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@suni/ui/components/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@suni/ui/components/table";
import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ClipboardList, Plus, Trash2, X } from "lucide-react";

import { useAppForm } from "@/components/form/use-app-form";
import { useListIngredients } from "@/hooks/use-ingredients";
import { useCreatePurchase, useUpdatePurchase } from "@/hooks/use-purchases";

import { PurchaseCatalog } from "./purchase-catalog";
import { purchaseAmount } from "./purchase-display";
import { PurchaseLeaveDialog } from "./purchase-leave-dialog";

type PurchaseInput = AppRouterInputs["purchases"]["create"];

type Purchase = Extract<
  AppRouterOutputs["purchases"]["get"],
  { scope: "purchase" }
>;

const INITIAL_VALUES: PurchaseInput = { notes: "", items: [], status: "draft" };

function decimalUnits(value: string, scale: number) {
  const [whole = "0", fractional = ""] = value.split(".");

  return BigInt(whole + fractional.padEnd(scale, "0"));
}

function estimateTotal(items: PurchaseInput["items"]) {
  let cents = 0n;

  for (const item of items) {
    const result = purchaseOrderItemSchema.safeParse(item);

    if (!result.success) {
      return null;
    }

    const { quantity, unitPrice } = result.data;

    if (unitPrice === null) {
      return null;
    }

    cents +=
      (decimalUnits(quantity, 3) * decimalUnits(unitPrice, 2) + 500n) / 1000n;
  }

  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

type SaveStatus = "draft" | "generated";

function PurchaseFormActions({
  count,
  saving,
  onSubmit,
}: {
  count: number;
  saving: boolean;
  onSubmit: (status: SaveStatus) => void;
}) {
  const disabled = saving || count === 0;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        disabled={disabled}
        onClick={() => onSubmit("draft")}
        type="button"
        variant="outline"
      >
        Guardar borrador
      </Button>
      <Button
        disabled={disabled}
        onClick={() => onSubmit("generated")}
        type="button"
      >
        {saving ? "Guardando…" : "Generar orden"}
      </Button>
    </div>
  );
}

function preparePurchaseDraft(draft?: Purchase) {
  const snapshots = new Map(
    draft?.orders.flatMap((order) =>
      order.items.map(
        (item) =>
          [
            item.ingredientId,
            {
              name: item.ingredientName,
              unit: item.unit,
              supplier: { name: order.supplierName },
            },
          ] as const
      )
    )
  );

  const defaultValues: PurchaseInput = draft
    ? {
        status: "draft",
        notes: draft.notes,
        items: draft.orders.flatMap((order) =>
          order.items.map(({ ingredientId, quantity, unitPrice }) => ({
            ingredientId,
            quantity,
            unitPrice: unitPrice ?? "",
          }))
        ),
      }
    : INITIAL_VALUES;

  return { snapshots, defaultValues };
}

export function PurchaseForm({ draft }: { draft?: Purchase }) {
  const navigate = useNavigate();
  const create = useCreatePurchase();
  const update = useUpdatePurchase();
  const saving = create.isPending || update.isPending;
  const catalog = useListIngredients({ status: "active" });
  const ingredients = catalog.data ?? [];

  const byId = new Map(
    ingredients.map((ingredient) => [ingredient.id, ingredient])
  );

  const { snapshots, defaultValues } = preparePurchaseDraft(draft);

  function onSuccess({ id }: { id: string }) {
    navigate({
      ignoreBlocker: true,
      to: "/purchases/$purchaseId",
      params: { purchaseId: id },
    });
  }

  function persist(
    payload: ReturnType<typeof purchaseCreateSchema.parse>,
    onSaved: (data: { id: string }) => void
  ) {
    if (draft) {
      update.mutate({ ...payload, id: draft.id }, { onSuccess: onSaved });
    } else {
      create.mutate(payload, { onSuccess: onSaved });
    }
  }

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: purchaseCreateSchema },
    onSubmit: ({ value }) =>
      persist(purchaseCreateSchema.parse(value), onSuccess),
  });

  function submit(status: SaveStatus) {
    form.setFieldValue("status", status);
    form.handleSubmit();
  }

  function saveAndLeave(proceed: () => void, reset: () => void) {
    const result = purchaseCreateSchema.safeParse({
      ...form.state.values,
      status: "draft",
    });

    if (!result.success) {
      reset();
      submit("draft");

      return;
    }

    persist(result.data, proceed);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit("draft");
      }}
    >
      <form.Field name="items" mode="array">
        {(lines) => {
          const items = lines.state.value;

          const selected = new Set(
            items.map(({ ingredientId }) => ingredientId)
          );

          return (
            <section
              aria-labelledby="purchase-order-heading"
              className="bg-card min-w-0 overflow-hidden rounded-xl border"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-sm font-semibold"
                    id="purchase-order-heading"
                  >
                    Partidas de la orden
                  </h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button disabled={saving} size="sm" type="button" />
                    }
                  >
                    <Plus aria-hidden /> Agregar ingredientes
                  </SheetTrigger>
                  <SheetContent
                    className="data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
                    showCloseButton={false}
                  >
                    <div className="border-b">
                      <SheetHeader>
                        <SheetTitle>Agregar ingredientes</SheetTitle>
                        <SheetDescription>
                          Busca ingredientes y selecciónalos para la orden.
                        </SheetDescription>
                        <SheetClose
                          render={
                            <Button
                              aria-label="Cerrar catálogo"
                              className="absolute top-3 right-3"
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            />
                          }
                        >
                          <X aria-hidden />
                        </SheetClose>
                      </SheetHeader>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                      <PurchaseCatalog
                        ingredients={ingredients}
                        query={catalog}
                        selected={selected}
                        disabled={items.length >= 500 || saving}
                        onAdd={(ingredient) =>
                          lines.pushValue({
                            ingredientId: ingredient.id,
                            quantity: "1",
                            unitPrice: ingredient.price ?? "",
                          })
                        }
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {items.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <span className="bg-muted mb-1 rounded-full p-3">
                    <ClipboardList aria-hidden className="size-6" />
                  </span>
                  <p className="text-foreground text-sm font-medium">
                    No hay ingredientes agregados
                  </p>
                  <p className="text-sm">
                    Abre el catálogo para agregar la primera partida.
                  </p>
                </div>
              ) : (
                <Table
                  aria-label="Partidas de la orden"
                  className="min-w-[40rem]"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Ingrediente</TableHead>
                      <TableHead scope="col">Proveedor</TableHead>
                      <TableHead scope="col" className="w-28">
                        Cantidad
                      </TableHead>
                      <TableHead scope="col" className="w-36">
                        Precio unitario
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Importe
                      </TableHead>
                      <TableHead scope="col">
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(({ ingredientId }, index) => {
                      const ingredient =
                        byId.get(ingredientId) ?? snapshots.get(ingredientId);

                      const name =
                        ingredient?.name ?? "Ingrediente no disponible";

                      return (
                        <TableRow key={ingredientId}>
                          <TableCell>
                            <span className="font-medium">{name}</span>
                            {ingredient ? (
                              <span className="text-muted-foreground block text-xs">
                                {ingredient.unit}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {ingredient?.supplier.name}
                            </span>
                          </TableCell>
                          <TableCell className="[&_label]:sr-only">
                            <form.AppField name={`items[${index}].quantity`}>
                              {(field) => (
                                <field.TextField
                                  inputMode="decimal"
                                  label={`Cantidad de ${name}`}
                                  required
                                />
                              )}
                            </form.AppField>
                          </TableCell>
                          <TableCell className="[&_label]:sr-only">
                            <form.AppField name={`items[${index}].unitPrice`}>
                              {(field) => (
                                <field.TextField
                                  inputMode="decimal"
                                  label={`Precio unitario de ${name} (MXN)`}
                                  required
                                />
                              )}
                            </form.AppField>
                          </TableCell>
                          <TableCell className="text-right">
                            <form.Subscribe
                              selector={(state) => state.values.items[index]}
                            >
                              {(item) =>
                                purchaseAmount(
                                  item ? estimateTotal([item]) : null
                                )
                              }
                            </form.Subscribe>
                          </TableCell>
                          <TableCell>
                            <Button
                              aria-label={`Quitar ${name}`}
                              disabled={saving}
                              onClick={() => lines.removeValue(index)}
                              size="icon-sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 aria-hidden />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="text-right" colSpan={4}>
                        Total estimado (MXN)
                      </TableCell>
                      <TableCell className="text-right">
                        <form.Subscribe
                          selector={(state) => state.values.items}
                        >
                          {(currentItems) => (
                            <strong className="tabular-nums">
                              {purchaseAmount(estimateTotal(currentItems))}
                            </strong>
                          )}
                        </form.Subscribe>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </section>
          );
        }}
      </form.Field>
      <form.AppField name="notes">
        {(field) => <field.TextField label="Notas" maxLength={2000} />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.items.length}>
        {(count) => (
          <PurchaseFormActions
            count={count}
            onSubmit={submit}
            saving={saving}
          />
        )}
      </form.Subscribe>
      <PurchaseLeaveDialog
        canSave={() => form.state.values.items.length > 0}
        hasChanges={() =>
          form.state.isDirty &&
          (Boolean(draft) || form.state.values.items.length > 0)
        }
        onSave={saveAndLeave}
        saving={saving}
      />
    </form>
  );
}
