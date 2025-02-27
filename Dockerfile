# Builder stage
FROM node:22-alpine AS builder
RUN npm install -g pnpm@10

WORKDIR /build

COPY . .

RUN pnpm install
RUN pnpm build

# Runner stage
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package.json .
COPY --from=builder /build/pnpm-lock.yaml .
COPY .env .

RUN npm install

HEALTHCHECK --interval=20s --timeout=5s --retries=3 \
  CMD wget -q --spider localhost:3000/examples || exit 1

CMD ["node", "dist/src/main"]
