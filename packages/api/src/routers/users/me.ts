import { protectedProcedure } from "../../index";

export const me = protectedProcedure
  .route({ method: "GET", path: "/me" })
  .handler(({ context }) => context.session.user);
