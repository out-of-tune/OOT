FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
# The service writes the shared objects below its directory (SHARE_LOC).
RUN chown node:node /usr/src/app
USER node
EXPOSE 4444
CMD ["node", "index.js"]
