import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Link } from "@tanstack/react-router";

import { formatDate } from "@/lib/date-utils";

type Customer = NonNullable<AppRouterOutputs["customers"]["get"]>;

type CustomerDataCustomer = Pick<
  Customer,
  | "acquisition"
  | "street"
  | "intNumber"
  | "extNumber"
  | "suburb"
  | "city"
  | "state"
  | "postalCode"
  | "phone"
  | "phoneExtension"
  | "updatedAt"
>;

interface CustomerDataProps {
  customer: CustomerDataCustomer;
  isAdmin?: boolean;
  seller?: { id: string; name: string } | null;
}

export function CustomerData({
  customer,
  isAdmin = false,
  seller,
}: CustomerDataProps) {
  return (
    <div className="flex flex-col">
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="font-bold">Medio de adquisición: </span>
        <span className="underline">{customer.acquisition}</span>
      </div>

      {isAdmin && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-bold">Vendedor: </span>
          {seller ? (
            <Link
              className="text-success hover:underline"
              params={{ userId: seller.id }}
              to="/users/$userId/edit"
            >
              {seller.name}
            </Link>
          ) : (
            <span>—</span>
          )}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-bold">Dirección Fiscal</h2>
        <div className="flex flex-col">
          <span className="mt-2 text-sm">
            {customer.street}
            {customer.intNumber && `, No. Int. ${customer.intNumber}`}
            {customer.extNumber && `, No. Ext. ${customer.extNumber}`}
            {customer.suburb && `, Colonia ${customer.suburb}`}
          </span>
          <span className="text-sm">
            {`${customer.city}, ${customer.state}, CP ${customer.postalCode}`}
          </span>
        </div>
      </div>

      {customer.phone && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-bold">Teléfono: </span>
          <span>
            {customer.phone}
            {customer.phoneExtension && ` ext. ${customer.phoneExtension}`}
          </span>
        </div>
      )}

      <span className="mt-6 text-sm italic">
        Última actualización: {formatDate(customer.updatedAt)}
      </span>
    </div>
  );
}

export default CustomerData;
