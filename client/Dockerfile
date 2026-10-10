# Build stage. docker-compose.override.yml also uses it as the development server.
FROM node:24-alpine AS build-stage

ARG NODE_ENV=production
ARG VITE_PROXY_URI
ARG BASE_URL=/

ENV VITE_PROXY_URI=$VITE_PROXY_URI
ENV BASE_URL=$BASE_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN NODE_ENV=$NODE_ENV npm run build

# Production stage: static files served by nginx.
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types

EXPOSE 8080
