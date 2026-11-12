import { contact } from "@suni/db/schema/contacts";
import { createContactSchema } from "@suni/db/validation/contacts";

import { scopedProcedure } from "../../index";
import { ownBranches } from "../../util/scope";
import { statusWhere } from "../../util/status";

export const create = scopedProcedure
  .route({ method: "POST", path: "/" })
  .input(createContactSchema)
  .handler(async ({ input, context, errors }) => {
    const { userId } = context;

    const parent = await context.db.query.branch.findFirst({
      where: {
        AND: [
          { id: input.branchId, customerId: input.customerId },
          statusWhere("branch", "active"),
          ownBranches(context),
        ],
      },
      columns: { id: true },
    });

    if (!parent) {
      throw errors.NOT_FOUND({
        message:
          "La sucursal no existe, no pertenece al cliente, o ella o su cliente están archivados",
      });
    }

    const [created] = await context.db
      .insert(contact)
      .values({ ...input, modifiedBy: userId })
      .returning({ id: contact.id });

    return created;
  });
