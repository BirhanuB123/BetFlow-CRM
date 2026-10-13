FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=development \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=300000

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/config/package*.json ./packages/config/
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev --no-audit --no-fund

COPY . .
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]
