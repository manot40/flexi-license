
ARG DATABASE_URL
ARG NEXT_JWT_SECRET
ARG NEXT_JWT_EXPIRATION=1d
ARG NEXT_FLEXI_API_URL
ARG NEXT_FLEXI_API_USER
ARG NEXT_FLEXI_API_PASS

FROM node:16-slim AS builder
RUN apt update && apt install openssl ca-certificates -y
WORKDIR /app

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

RUN npm ci
RUN npm run db:generate
RUN npm run build

# Production build start
FROM node:16-slim AS runner
RUN apt update && apt install openssl ca-certificates -y
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Arguments for the production build
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ARG NEXT_JWT_SECRET
ENV NEXT_JWT_SECRET $NEXT_JWT_SECRET

ARG NEXT_JWT_EXPIRATION
ENV NEXT_JWT_EXPIRATION $NEXT_JWT_EXPIRATION

ARG NEXT_FLEXI_API_URL
ENV NEXT_FLEXI_API_URL $NEXT_FLEXI_API_URL

ARG NEXT_FLEXI_API_USER
ENV NEXT_FLEXI_API_USER $NEXT_FLEXI_API_USER

ARG NEXT_FLEXI_API_PASS
ENV NEXT_FLEXI_API_PASS $NEXT_FLEXI_API_PASS

# Copy the production build file from builder
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/package-lock.json package-lock.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/static .next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public public

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]