FROM node:20-alpine AS builder
WORKDIR /app

# Retry registry downloads when the deployment server briefly loses its npm
# connection. No runtime secret belongs in this Dockerfile.
ENV NODE_ENV=development \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=300000

# The Docker build context is the repository root, so the API can use the
# workspace manifests and packages shared with the frontend.
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev --no-audit --no-fund

COPY . .
RUN npm exec -w apps/api -- prisma generate --schema=prisma/schema.prisma
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages ./packages

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma || true; node apps/api/dist/main.js"]
