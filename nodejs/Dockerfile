FROM node:lts-alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npx tsx src/importdb.ts && npx tsx src/server.ts"]