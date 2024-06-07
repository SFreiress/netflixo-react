FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
