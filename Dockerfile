FROM node:20-alpine AS base

### Dependencies ###
FROM base AS deps
RUN apk add --no-cache libc6-compat git curl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Builder
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ls
# Copy environment files for build time
COPY .env.development .env.development
COPY .env.production .env.production

# Accept build argument for environment (no default - must be provided)
ARG ENV_FILE

# Copy the specified environment file as .env.local
COPY ${ENV_FILE} .env.local

# Set environment variables for build time (these will be baked into the build)
ENV NODE_ENV=production
RUN npm run build

### Production image runner ###
FROM base AS runner

# Disable Next.js telemetry
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for health checks
RUN apk add --no-cache curl

# Set correct permissions for nextjs user and don't run as root
RUN addgroup nodejs
RUN adduser -SDH nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy only the necessary files for runtime
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy environment files for runtime
COPY --from=builder --chown=nextjs:nodejs /app/.env.development ./.env.development
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./.env.production
COPY --from=builder --chown=nextjs:nodejs /app/.env.local ./.env.local

USER nextjs

# Exposed port (for orchestrators and dynamic reverse proxies)
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:3000/" ]

# Run the nextjs app
CMD ["node", "server.js"] 