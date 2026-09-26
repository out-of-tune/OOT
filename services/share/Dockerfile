FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
# The shared objects live in /usr/src/app/data (SHARE_LOC). docker-compose.yml mounts a volume there,
# and a new volume takes the owner of this directory.
RUN mkdir -p data && chown node:node /usr/src/app data
USER node
EXPOSE 4444
CMD ["node", "index.js"]
