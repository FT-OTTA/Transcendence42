FROM node:lts-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# =========================
# 1. BACKEND
# =========================
COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

# =========================
# 2. FRONTEND (NEXT)
# =========================
COPY front/package*.json ./front/
RUN cd front && npm install

COPY front ./front
RUN cd front && npm run build

# =========================
# 3. FULL SOURCE
# =========================
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npx tsx src/importdb.ts && npx tsx src/server.ts"]