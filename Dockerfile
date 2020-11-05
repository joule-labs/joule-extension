# This Dockerfile can be used to build a production release of joule:
#
# Usage:
# 1. Build the docker image
# 2. Get the production distribution .zip file from the image

# $ docker build -t joule .
# $ docker run --rm -v "$(pwd):/out" joule sh -c "cp /app/dist-prod/joule*.zip /out"
# ls ./out
#
FROM node:lts-alpine
WORKDIR /app
COPY . /app
RUN rm -rf /app/dist-prod # remove potentially old folder
RUN yarn
RUN yarn build
#COPY /app/dist-prod/joule-v0.5.2.zip /out

