import { z } from "zod";

export const role = z.enum(["user", "admin"]);
