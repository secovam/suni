import type { AppRouterOutputs } from "@suni/api/routers/index";
import { Link } from "@tanstack/react-router";

import { formatDate } from "@/lib/date-utils";

interface CustomerDataProps {
  customer: AppRouterOutputs["customers"]["get"];
}

export function CustomerData({ customer }: CustomerDataProps) {
  return (
    <div className="flex flex-col">
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="font-bold">Medio de adquisición:</dt>
          <dd>{customer.acquisition}</dd>
        </div>

        {customer.seller && (
          <div className="flex items-center gap-2">
            <dt className="font-bold">Vendedor:</dt>
            <dd>
              <Link
                className="text-success hover:underline"
                params={{ userId: customer.seller.id }}
                to="/users/$userId/edit"
              >
                {customer.seller.name}
              </Link>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-6">
        <h2 className="text-sm font-bold">Dirección Fiscal</h2>
        <address className="flex flex-col not-italic">
          <span className="mt-2 text-sm">
            {customer.street}, No. Ext. {customer.extNumber}
            {customer.intNumber && `, No. Int. ${customer.intNumber}`}, Colonia{" "}
            {customer.suburb}
          </span>
          <span className="text-sm">
            {`${customer.city}, ${customer.state}, CP ${customer.postalCode}`}
          </span>
        </address>
      </div>

      <dl className="mt-2 flex items-center gap-2 text-sm">
        <dt className="font-bold">Teléfono:</dt>
        <dd>
          {customer.phone}
          {customer.phoneExtension && ` ext. ${customer.phoneExtension}`}
        </dd>
      </dl>

      <span className="mt-6 text-sm italic">
        Última actualización: {formatDate(customer.updatedAt)}
      </span>
    </div>
  );
}
