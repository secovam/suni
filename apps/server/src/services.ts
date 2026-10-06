import { createAuth } from "@suni/auth";
import { emailService } from "@suni/auth/services/email-service";
import { createDb } from "@suni/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);

export const auth = createAuth(
  {
    BETTER_AUTH_URL: ENV.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: ENV.BETTER_AUTH_SECRET,
    CORS_ORIGIN: ENV.CORS_ORIGIN,
    NODE_ENV: ENV.NODE_ENV,
    sendMagicLink: (params) => emailService.sendMagicLink(params),
  },
  db
);
