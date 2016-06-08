FROM node:6

WORKDIR /Users/janetchen/WebstormProjects/ChatOps
COPY package.json .

RUN npm install

COPY . .

CMD ["/usr/local/bin/node", "index.js"]
