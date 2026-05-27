FROM node:lts-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# =========================
# 1. BACKEND
# =========================
COPY package*.json ./
RUN npm install

# =========================
# 2. FRONTEND (NEXT)
# =========================
COPY front/package*.json ./front/
RUN cd front && npm install

# =========================
# 3. FULL SOURCE (avant les builds)
# =========================
COPY . .

# Build Next.js
RUN cd front && npm run build

# Prisma generate (après COPY)
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npx tsx src/importdb.ts && npx tsx src/server.ts"]