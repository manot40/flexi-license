
ARG DATABASE_URL
ARG NEXT_JWT_SECRET
ARG NEXT_JWT_EXPIRATION=1d

FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat openssl ca-certificates
WORKDIR /app

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

RUN npm ci
RUN npm run db:generate
RUN npm run build

# Production build start
FROM node:16-alpine AS runner
RUN apk add --no-cache libc6-compat openssl ca-certificates
WORKDIR /app

# Arguments for the production build
ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

ARG NEXT_JWT_SECRET
ENV NEXT_JWT_SECRET $NEXT_JWT_SECRET

ARG NEXT_JWT_EXPIRATION
ENV NEXT_JWT_EXPIRATION $NEXT_JWT_EXPIRATION

# Copy the production build file from builder
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/package-lock.json package-lock.json

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["npm", "run", "start"]