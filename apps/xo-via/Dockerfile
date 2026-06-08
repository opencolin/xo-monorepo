# syntax=docker.io/docker/dockerfile:1

ARG NODE_VERSION=24.13.0-slim

# ---------- deps ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# pnpm-first; yarn/npm fallback for compatibility with cloned templates.
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* .npmrc* ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.npm \
    if [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      corepack enable yarn && yarn install --frozen-lockfile --production=false; \
    elif [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      echo "No lockfile found." && exit 1; \
    fi

# ---------- builder ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Build-time placeholders, swapped by entrypoint.sh at runtime so one
# image can serve every environment.
ENV NEXT_PUBLIC_ENVIRONMENT=__NEXT_PUBLIC_ENVIRONMENT__

RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm build; \
    elif [ -f yarn.lock ]; then \
      corepack enable yarn && yarn build; \
    elif [ -f package-lock.json ]; then \
      npm run build; \
    else \
      echo "No lockfile found." && exit 1; \
    fi

# ---------- runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV ENVIRONMENT=production

COPY --from=builder --chown=node:node /app/public ./public

RUN mkdir .next && chown node:node .next

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh && chown node:node /app

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
