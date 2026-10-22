# syntax=docker/dockerfile:1.4

# ---- Base Stage ----
FROM node:22-bullseye-slim AS base
RUN npm install -g pnpm@11.28.6

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --ignore-scripts

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma/
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY src ./src

RUN pnpm exec prisma generate
RUN pnpm run build

# ---- Runner Stage ----
FROM base AS runner
ENV NODE_ENV=production

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copia os artefatos compilados e dependências
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma/

USER nestjs

EXPOSE 3333

CMD ["node", "dist/src/server.js"]