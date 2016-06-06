FROM node:6

WORKDIR /ChatOps
COPY package.json .

RUN npm install

COPY . .

CMD node index.js
