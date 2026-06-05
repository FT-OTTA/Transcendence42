FROM node:lts-alpine

WORKDIR /app

COPY front/package*.json ./front/
COPY nodejs/src/types ./nodejs/src/types/

WORKDIR /app/front
RUN npm i

COPY front ./
COPY nodejs/src/types ../nodejs/src/types/

RUN npm run build

EXPOSE 3001

CMD ["npm", "start", "--", "-H", "0.0.0.0"]
