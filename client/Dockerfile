 # build stage
FROM node:lts-alpine as build-stage

ARG PORT
ARG NODE_ENV
ARG VUE_APP_APOLLO_HOST
ARG VUE_APP_AUTH_HOST
ARG VUE_APP_PROXY_URI
ARG VUE_APP_PROXY_PORT
ARG VUE_APP_KEY
ARG VUE_APP_SECRET
ARG VUE_APP_ANALYTICS

ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV VUE_APP_APOLLO_HOST=$VUE_APP_APOLLO_HOST
ENV VUE_APP_AUTH_HOST=$VUE_APP_AUTH_HOST
ENV VUE_APP_PROXY_URI=$VUE_APP_PROXY_URI
ENV VUE_APP_PROXY_PORT=$VUE_APP_PROXY_PORT
ENV VUE_APP_SECRET=$VUE_APP_SECRET
ENV VUE_APP_KEY=$VUE_APP_KEY
ENV VUE_APP_ANALYTICS=$VUE_APP_ANALYTICS

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
ARG PORT
ENV PORT=$PORT
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY mime.types  /etc/nginx/mime.types
COPY run_nginx.sh ./
EXPOSE $PORT
CMD ["/run_nginx.sh"]