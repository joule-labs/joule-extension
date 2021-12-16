# This Dockerfile can be used to build a production release of joule:
#
# Use `yarn build:docker` to build the dockerfile and copy out the deterministic build.

FROM node:14-slim
RUN apt-get update
RUN apt-get install strip-nondeterminism --yes

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN ls -la
RUN yarn
COPY . ./
RUN yarn build
RUN strip-nondeterminism dist-prod/joule-*.zip
RUN sha256sum -b dist-prod/joule-*.zip | cut -d " " -f 1 > sha256.txt
