FROM node:19
USER "node"
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm --quiet --no-progress ci && npm cache clean --force

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
