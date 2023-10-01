 # build stage
FROM node:16 as build-stage

ARG VITE_PROXY_URI

ENV VITE_PROXY_URI=$VITE_PROXY_URI

WORKDIR /app
COPY package*.json ./
RUN NODE_ENV=development npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types  /etc/nginx/mime.types

EXPOSE 8080
