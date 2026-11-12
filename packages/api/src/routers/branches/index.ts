import { o } from "../../index";
import { create } from "./create";
import { get } from "./get";
import { list } from "./list";
import { setArchived } from "./set-archived";
import { update } from "./update";

export const branchesRouter = o
  .prefix("/branches")
  .tag("Branches")
  .router({ list, get, create, update, setArchived });
