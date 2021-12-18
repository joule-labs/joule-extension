# This Dockerfile can be used to build a production release of joule:
#
# Use `yarn build:docker` to build the dockerfile and copy out the deterministic build.

FROM node:14-slim
RUN apt-get update
RUN apt-get install -y unzip
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN ls -la
RUN yarn
COPY . ./
RUN yarn build
RUN cd dist-prod && find . -type f ! -name '*.zip' -exec sha256sum {} \; > manifest.txt
