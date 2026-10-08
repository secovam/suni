FROM node:24-slim AS builder
WORKDIR /app

COPY . .
RUN npm install -g pnpm@$(node -p "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).packageManager.split('@').pop()")
# The Docker build context excludes .git, so skip only the Git hook installer.
RUN node -e "const fs = require('fs'); const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8')); fs.copyFileSync('package.json', '/tmp/suni-package.json'); delete manifest.scripts.prepare; fs.writeFileSync('package.json', JSON.stringify(manifest));" \
    && CI=true pnpm install --frozen-lockfile --store-dir /pnpm-store \
    && mv /tmp/suni-package.json package.json

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
ENV NODE_ENV=production
RUN cd apps/web && pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
