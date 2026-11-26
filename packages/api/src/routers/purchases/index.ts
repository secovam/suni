import { o } from "../../index";
import { create } from "./create";
import { get } from "./get";
import { list } from "./list";
import { update } from "./update";

export const purchasesRouter = o.prefix("/purchases").tag("Purchases").router({
  list,
  get,
  create,
  update,
});
