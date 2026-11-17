FROM node:24-slim AS builder
RUN npm install -g pnpm@12.4.1
WORKDIR /app

COPY . .
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/pnpm-store pnpm install --store-dir /pnpm-store

ENV NODE_ENV=production
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local cd apps/server && pnpm run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 3000

WORKDIR /app/apps/server
# Apply pending migrations before serving; a failed migration stops the container so the deploy fails.
CMD ["sh", "-c", "cd /app/packages/db && bunx drizzle-kit migrate && cd /app/apps/server && exec bun dist/index.mjs"]
