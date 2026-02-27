# ============================================
# Dockerfile for Node.js App 2
# ============================================
# Same as App 1 - both apps use identical setup

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
