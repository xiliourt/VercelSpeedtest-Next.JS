FROM node:current-alpine3.22

WORKDIR /app
COPY package*.json /app
RUN --mount=type=cache,target=/home/runner/work/VercelSpeedtest-Next.JS/VercelSpeedtest-Next.JS/.npm npm install
COPY . .
RUN npm run build
CMD npm start
