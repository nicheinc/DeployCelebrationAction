ARG REGISTRY="docker.io/library"
ARG NODE_IMAGE="${REGISTRY}/node:16-alpine"
FROM ${NODE_IMAGE} AS base

WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS build
WORKDIR /app
COPY . ./
RUN npm i

FROM ${NODE_IMAGE} AS final

# Set the unprivileged "node" user as /app owner
# Setting the "node" user as the owner of the directory and
# all the contents is needed for the app to run.  This allows
# the app to make changes to files, and directories once the
# docker container has been built.
USER node
WORKDIR /app
COPY --from=build --chown=node:node /app /app

CMD [ "node", "./socket/trigger.js" ]