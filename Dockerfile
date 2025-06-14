FROM node:current-alpine3.22

WORKDIR /app
COPY package*.json /app
RUN --mount=type=cache,target=.npm npm install
COPY . .
RUN npm run build
CMD npm start
