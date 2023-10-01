FROM node:19 as oot-service
WORKDIR /oot
ARG WORKSPACE
ENV WORKSPACE=$WORKSPACE
COPY . .
RUN npm --quiet --no-progress ci --workspace=$WORKSPACE
# Install again with only production packages. Setup/building etc. must be done as a "postinstall" script
RUN npm --quiet --no-progress ci --workspace=$WORKSPACE --omit=dev --ignore-scripts
RUN npm cache clean --force
CMD [ "npm", "start", "--workspace=${WORKSPACE}"]
