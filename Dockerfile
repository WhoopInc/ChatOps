FROM node:6

WORKDIR /ChatOps
COPY package.json ./

RUN npm install

COPY . .

CMD ["/usr/local/bin/node", "index.js"]
