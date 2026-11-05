import { ORPCError } from "@orpc/server";
import { contact } from "@suni/db/schema/contacts";
import { createContactSchema } from "@suni/db/validation/contacts";

import { isAdmin, protectedProcedure } from "../../index";

export const create = protectedProcedure
  .route({ method: "POST", path: "/" })
  .input(createContactSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    const admin = await isAdmin(context, userId);

    const parent = await context.db.query.branch.findFirst({
      where: {
        id: input.branchId,
        customerId: input.customerId,
        archived: { isNull: true },
        sellerId: admin ? undefined : userId,
      },
      columns: { id: true },
    });

    if (!parent) {
      throw new ORPCError("NOT_FOUND", {
        message:
          "La sucursal no existe, está archivada o no pertenece al cliente",
      });
    }

    const [created] = await context.db
      .insert(contact)
      .values({ ...input, modifiedBy: userId })
      .returning({ id: contact.id });

    return created;
  });
