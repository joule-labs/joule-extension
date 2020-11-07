# This Dockerfile can be used to build a production release of joule:
#
# Usage:
# 1. Build the docker image
# 2. Get the production distribution .zip file from the image

# $ docker build -t joule .
# $ docker run --rm -v "$(pwd):/out" joule sh -c "cp /app/dist-prod/joule*.zip /out"
# ls ./out
#
FROM node:lts
run apt-get update
RUN apt-get install strip-nondeterminism --yes

WORKDIR /app
COPY . /app
RUN rm -rf /app/dist-prod # remove potentially old folder
RUN yarn
RUN yarn build
RUN strip-nondeterminism /app/dist-prod/joule-*.zip
RUN sha256sum -b /app/dist-prod/joule-*.zip
#COPY /app/dist-prod/joule-v0.5.2.zip /out

