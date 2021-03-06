FROM node:14.18.1-alpine3.14 as builder

## cpu type
ARG arch

## add package
RUN apk add --no-cache make git bash

## clone henmiss
RUN cd /root \
    && git clone https://github.com/hermeslin/henmiss.git \
    && cd /root/henmiss

## copy environment variables file
COPY ./.env /root/henmiss/.env

## build henmiss
WORKDIR /root/henmiss

# RUN npm install -g yarn
RUN yarn install
RUN if [ "${arch}" = "arm64" ]; \
        then yarn pack:alpine:arm64; \
        else yarn pack:alpine; \
    fi

## make minimum runtime stage
FROM alpine:3.14

COPY --from=builder "/root/henmiss/release/henmiss" "/henmiss/henmiss"
COPY --from=builder "/root/henmiss/.env" "/henmiss/.env"
WORKDIR /henmiss

ENTRYPOINT ["./henmiss"]