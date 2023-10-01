FROM node:18
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

EXPOSE 4444
CMD [ "npm", "start" ]
