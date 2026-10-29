import { o } from "../../index";
import { create } from "./create";
import { get } from "./get";
import { list } from "./list";
import { setArchived } from "./set-archived";
import { update } from "./update";

export const customersRouter = o
  .prefix("/customers")
  .tag("Customers")
  .router({ list, get, create, update, setArchived });
