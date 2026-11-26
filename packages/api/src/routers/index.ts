import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { branchesRouter } from "./branches";
import { contactsRouter } from "./contacts";
import { customersRouter } from "./customers";
import { ingredientsRouter } from "./ingredients";
import { purchasesRouter } from "./purchases";
import { suppliersRouter } from "./suppliers";
import { usersRouter } from "./users";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: "This is private",
    user: context.session.user,
  })),
  users: usersRouter,
  customers: customersRouter,
  suppliers: suppliersRouter,
  ingredients: ingredientsRouter,
  purchases: purchasesRouter,
  branches: branchesRouter,
  contacts: contactsRouter,
};

export type AppRouter = typeof appRouter;

export type AppRouterClient = RouterClient<typeof appRouter>;

export type AppRouterInputs = InferRouterInputs<AppRouter>;

export type AppRouterOutputs = InferRouterOutputs<AppRouter>;
