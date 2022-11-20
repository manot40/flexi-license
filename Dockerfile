FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .

RUN npm ci
RUN npm run db:generate:prod
RUN npm run build

# Production build start
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

COPY --from=builder /app/.next .
COPY --from=builder /app/public .
COPY --from=builder /app/.env.production .
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]