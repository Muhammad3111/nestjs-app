# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# copy lock + manifest and install (cached)
COPY package*.json ./
RUN npm ci

# copy source and build to /app/dist
COPY . .
RUN npm run build

# ---- production stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy built output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# adjust path if your compiled entry file is different
CMD ["node", "dist/main.js"]
