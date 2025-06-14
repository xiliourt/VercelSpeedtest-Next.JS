FROM node:current-alpine3.22

WORKDIR /app
COPY package*.json /app
RUN --mount=type=cache,target=/root/.npm npm install
COPY . .
RUN --mount=type=cache,target=/root/.next npm run build
CMD npm start
