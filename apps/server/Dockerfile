FROM node:24-slim AS builder
WORKDIR /app

COPY . .
RUN npm install -g pnpm@$(node -p "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).packageManager.split('@').pop()")
# The Docker build context excludes .git, so skip only the Git hook installer.
RUN node -e "const fs = require('fs'); const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8')); fs.copyFileSync('package.json', '/tmp/suni-package.json'); delete manifest.scripts.prepare; fs.writeFileSync('package.json', JSON.stringify(manifest));" \
    && CI=true pnpm install --frozen-lockfile --store-dir /pnpm-store \
    && mv /tmp/suni-package.json package.json

ENV NODE_ENV=production
RUN cd apps/server && pnpm run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app

EXPOSE 3000

WORKDIR /app/apps/server
CMD ["bun", "dist/index.mjs"]
