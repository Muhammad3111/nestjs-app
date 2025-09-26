# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- production stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# install pg_isready (postgres client) so the compose wait-loop works
RUN apk add --no-cache postgresql-client

# only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy built output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
