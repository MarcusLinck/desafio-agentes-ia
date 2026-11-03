# syntax=docker/dockerfile:1.4

# ---- Base Stage ----
FROM node:22-bullseye-slim AS base
RUN npm install -g pnpm@11.28.6

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --ignore-scripts

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client and run build
RUN pnpm exec prisma generate 2>&1 || true
RUN pnpm run build

# ---- Runner Stage ----
FROM base AS runner
ENV NODE_ENV=production

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copia os artefatos compilados e dependências
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

EXPOSE 3333

CMD ["node", "dist/src/server.js"]