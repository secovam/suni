import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { customersRouter } from "./customers";
import { usersRouter } from "./users";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session?.user,
  })),
  users: usersRouter,
  customer: customersRouter,
};

export type AppRouter = typeof appRouter;

export type AppRouterClient = RouterClient<typeof appRouter>;

export type AppRouterInputs = InferRouterInputs<AppRouter>;

export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
