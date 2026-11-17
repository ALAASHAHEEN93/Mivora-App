# Mivora production image (Next.js standalone). Node 22 LTS, runs as a non-root user.
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# Full toolchain; also used by the one-off "migrate" and "seed" services.
FROM deps AS build
COPY . .
RUN pnpm prisma generate && pnpm build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 STORAGE_DIR=/app/storage
RUN useradd --system --uid 1001 mivora && mkdir -p /app/storage && chown mivora /app/storage
COPY --from=build --chown=mivora /app/.next/standalone ./
COPY --from=build --chown=mivora /app/.next/static ./.next/static
COPY --from=build --chown=mivora /app/messages ./messages
USER mivora
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
