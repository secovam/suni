import { o } from "../../index";
import { create } from "./create";
import { get } from "./get";
import { list } from "./list";
import { me } from "./me";
import { update } from "./update";

export const usersRouter = o
  .prefix("/users")
  .tag("Users")
  .router({ list, get, create, update, me });
