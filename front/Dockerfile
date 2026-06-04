FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

EXPOSE 3001

# This runs the dev server, it's not meant for production.
# Prod would build when the image is built then run npm start instead.
# The -H makes it listen on all interfaces, which it needs for the db etc.
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
