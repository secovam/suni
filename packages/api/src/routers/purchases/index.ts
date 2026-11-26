import { o } from "../../index";
import { cancel } from "./cancel";
import { create } from "./create";
import { get } from "./get";
import { list } from "./list";

export const purchasesRouter = o.prefix("/purchases").tag("Purchases").router({
  list,
  get,
  create,
  cancel,
});
