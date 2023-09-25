 # build stage
FROM node:16 as build-stage

ARG NODE_ENV
ARG VUE_APP_PROXY_URI

ENV NODE_ENV=$NODE_ENV
ENV VUE_APP_PROXY_URI=$VUE_APP_PROXY_URI

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types  /etc/nginx/mime.types

EXPOSE 8080
CMD ["nginx", "-g", "'daemon off;'"]
