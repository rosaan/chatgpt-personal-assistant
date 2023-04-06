##### DEPENDENCIES

FROM node:19-alpine3.17 AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM node:19-alpine3.17 AS builder
ENV NODE_ENV production
ENV DATABASE_URL "file:/app/data/db.sqlite"
ENV NEXTAUTH_URL "http://localhost:8080"
ENV NEXTAUTH_SECRET "secret"
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN \
    if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 NODE_ENV=production yarn build; \
    elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 NODE_ENV=production npm run build; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && SKIP_ENV_VALIDATION=1 NODE_ENV=production pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

RUN pnpm postinstall && pnpm migrate

##### RUNNER

FROM node:19-alpine3.17 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV DATABASE_URL "file:/app/data/db.sqlite"
ENV NEXTAUTH_URL "http://localhost:8080"
ENV NEXTAUTH_SECRET "secret"

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:root /app/data/db.sqlite /app/data/db.sqlite

USER nextjs

RUN chmod 664 /app/data/db.sqlite
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]