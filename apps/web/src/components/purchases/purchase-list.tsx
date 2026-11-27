import type {
  AppRouterInputs,
  AppRouterOutputs,
} from "@suni/api/routers/index";
import { PURCHASE_ORDER_STATUSES } from "@suni/db/schema/purchase-order-enums";
import { Badge } from "@suni/ui/components/badge";
import { Button } from "@suni/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@suni/ui/components/collapsible";
import { cn } from "@suni/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  ClipboardSignature,
  ClipboardList,
  ClipboardPenLine,
  ClipboardX,
  Layers,
  Send,
  Truck,
} from "lucide-react";
import { useRef } from "react";
import type { RefObject } from "react";

import { useListPurchases } from "@/hooks/use-purchases";

import {
  purchaseAmount,
  purchaseItemCount,
  PURCHASE_STATUS_COLOR,
} from "./purchase-display";
import { PurchaseStatus } from "./purchase-status";
import { SendPurchaseButton } from "./send-purchase-button";

type PurchaseEntry = AppRouterOutputs["purchases"]["list"][number];

type Status = PurchaseEntry["status"];

const dateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

const STATUS_GROUPS = {
  draft: { label: "Borradores", icon: ClipboardPenLine },
  generated: { label: "Generadas", icon: ClipboardSignature },
  sent: { label: "Enviadas", icon: Send },
  confirmed: { label: "Confirmadas", icon: ClipboardCheck },
  cancelled: { label: "Canceladas", icon: ClipboardX },
};

function PurchaseRow({
  entry,
  finalFocus,
}: {
  entry: PurchaseEntry;
  finalFocus: RefObject<HTMLDivElement | null>;
}) {
  const general = entry.scope === "purchase";
  const createdAt = general ? entry.createdAt : entry.purchase.createdAt;
  const total = general ? entry.activeTotal : entry.total;
  const multiple = general && entry.supplierCount > 1;
  const supplierNames = general ? entry.supplierNames : [entry.supplierName];

  const title = multiple
    ? `Compra con ${entry.supplierCount} proveedores`
    : (supplierNames[0] ?? "Compra general");

  const Icon = multiple ? Layers : Truck;

  return (
    <li
      className={cn(
        "bg-card hover:border-primary/30 rounded-lg border transition-colors",
        multiple && "border-s-primary/60 border-s-4"
      )}
    >
      <Link
        className="flex flex-wrap items-start justify-between gap-3 p-3"
        params={{ purchaseId: entry.id }}
        to="/purchases/$purchaseId"
      >
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg",
              multiple
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon aria-hidden className="size-4" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-primary text-sm font-semibold wrap-break-word">
              {title}
            </p>
            {multiple ? (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {supplierNames.join(" · ")}
              </p>
            ) : null}
            <p className="text-muted-foreground text-xs break-all">
              Folio {entry.folio}
            </p>
            <p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
              <CalendarDays aria-hidden className="size-3.5" />
              {dateFormat.format(createdAt)} ·{" "}
              {purchaseItemCount(entry.itemCount)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {purchaseAmount(total)}
          </span>
          <PurchaseStatus
            partial={general && entry.partiallyCancelled}
            status={entry.status}
          />
        </div>
      </Link>
      {general && entry.status === "draft" ? (
        <div className="border-t px-3 py-2">
          <Button
            nativeButton={false}
            render={
              <Link
                params={{ purchaseId: entry.id }}
                to="/purchases/$purchaseId/edit"
              />
            }
            size="sm"
            variant="outline"
          >
            Editar borrador
          </Button>
        </div>
      ) : null}
      {general && entry.status === "generated" ? (
        <div className="border-t px-3 py-2">
          <SendPurchaseButton
            finalFocus={finalFocus}
            folio={entry.folio}
            id={entry.id}
          />
        </div>
      ) : null}
    </li>
  );
}

function PurchaseStatusGroup({
  entries,
  status,
  finalFocus,
}: {
  entries: PurchaseEntry[];
  status: Status;
  finalFocus: RefObject<HTMLDivElement | null>;
}) {
  const { label, icon: Icon } = STATUS_GROUPS[status];

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Collapsible defaultOpen={status !== "cancelled"}>
        <CollapsibleTrigger className="group w-full">
          <span className="hover:bg-muted/60 group-data-panel-open:bg-muted/50 flex items-center justify-between gap-3 px-4 py-3 text-left">
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg",
                  PURCHASE_STATUS_COLOR[status]
                )}
              >
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="text-sm font-semibold">{label}</span>
              <Badge variant="secondary">{entries.length}</Badge>
            </span>
            <ChevronDown
              aria-hidden
              className="text-muted-foreground size-4 transition-transform group-data-panel-open:rotate-180"
            />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="bg-muted/20 grid gap-2 border-t p-3">
            {entries.map((entry) => (
              <PurchaseRow
                entry={entry}
                finalFocus={finalFocus}
                key={entry.id}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function PurchaseList({
  input,
}: {
  input: AppRouterInputs["purchases"]["list"];
}) {
  const query = useListPurchases(input);
  const finalFocus = useRef<HTMLDivElement>(null);

  if (query.isPending) {
    return (
      <output className="text-muted-foreground text-sm">
        Cargando órdenes de compra…
      </output>
    );
  }

  if (query.isError) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-destructive text-sm" role="alert">
          No se pudieron cargar las órdenes.
        </p>
        <Button onClick={() => query.refetch()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  if (query.data.length === 0) {
    return (
      <div className="text-muted-foreground bg-muted/20 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
        <ClipboardList aria-hidden className="size-8 opacity-60" />
        <p className="text-sm">No hay órdenes de compra para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={finalFocus} tabIndex={-1}>
      {PURCHASE_ORDER_STATUSES.map((status) => {
        const entries = query.data.filter((entry) => entry.status === status);

        return entries.length > 0 ? (
          <PurchaseStatusGroup
            entries={entries}
            finalFocus={finalFocus}
            key={status}
            status={status}
          />
        ) : null;
      })}
    </div>
  );
}
