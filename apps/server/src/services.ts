import { createAuth } from "@suni/auth";
import { createDb } from "@suni/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);

export const auth = createAuth(ENV, db);
