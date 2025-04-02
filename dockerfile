# base image
FROM node:20

WORKDIR /app

COPY package.json ./
COPY server.js ./

RUN npm install

# EXPOSE 4000

CMD ["node", "server.js"]