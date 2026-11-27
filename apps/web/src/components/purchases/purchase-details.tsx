import type { AppRouterOutputs } from "@suni/api/routers/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@suni/ui/components/table";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Truck } from "lucide-react";

import { purchaseAmount, purchaseItemCount } from "./purchase-display";
import { PurchaseStatus } from "./purchase-status";

type Entry = AppRouterOutputs["purchases"]["get"];

type SupplierOrder = Extract<Entry, { scope: "supplierOrder" }>;

function OrderItems({ items }: Pick<SupplierOrder, "items">) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">
        Esta orden no tiene partidas.
      </p>
    );
  }

  return (
    <Table aria-label="Partidas de la orden" className="min-w-[24rem]">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Ingrediente</TableHead>
          <TableHead scope="col">Cantidad</TableHead>
          <TableHead className="text-right" scope="col">
            Precio unitario (MXN)
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <span className="font-medium">{item.ingredientName}</span>
            </TableCell>
            <TableCell>
              <span className="whitespace-nowrap tabular-nums">
                {item.quantity} {item.unit}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <span className="tabular-nums">
                {purchaseAmount(item.unitPrice)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SupplierOrderDetails({
  order,
  link,
}: {
  order: Omit<SupplierOrder, "scope">;
  link: boolean;
}) {
  return (
    <section className="bg-card min-w-0 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
            <Truck aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-sm font-semibold wrap-break-word">
              {order.supplierName}
            </h2>
            <p className="text-muted-foreground text-xs break-all">
              Folio {order.folio} · RFC {order.supplierRfc}
            </p>
            <p className="text-muted-foreground text-xs">
              {purchaseItemCount(order.items.length)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm tabular-nums">
            {purchaseAmount(order.total)}
          </strong>
          <PurchaseStatus status={order.status} />
        </div>
      </div>
      <OrderItems items={order.items} />
      {link ? (
        <div className="flex justify-end border-t px-4 py-2">
          <Link
            className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            params={{ purchaseId: order.id }}
            to="/purchases/$purchaseId"
          >
            Ver orden individual <ArrowUpRight aria-hidden className="size-3" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function PurchaseDetails({ entry }: { entry: Entry }) {
  if (entry.scope === "supplierOrder") {
    return <SupplierOrderDetails link={false} order={entry} />;
  }

  const multiple = entry.orders.length > 1;

  return (
    <div className="space-y-4">
      {multiple ? (
        <div className="bg-muted/50 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border px-4 py-3 text-sm">
          <p>
            Proveedores vigentes{" "}
            <strong>
              {entry.activeSupplierCount} de {entry.supplierCount}
            </strong>
          </p>
          <p>
            Total vigente <strong>{purchaseAmount(entry.activeTotal)}</strong>
          </p>
        </div>
      ) : null}
      {entry.notes ? (
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
          {entry.notes}
        </p>
      ) : null}
      {entry.orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Esta compra no tiene órdenes.
        </p>
      ) : null}
      {entry.orders.map((order) => (
        <SupplierOrderDetails key={order.id} link order={order} />
      ))}
    </div>
  );
}
