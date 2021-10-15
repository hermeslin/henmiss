# henmiss
Help you collect NTFs on HEN smoothly

## Installation
Copy `.env-example` to `.env` file and then change the values if you want.

### docker
```sh
## build docker image
docker build -t henmiss:latest --no-cache .

## run this program
docker run -it henmiss:latest --help
```

### docker compose
```sh
## build docker image
docker compose build --no-cache

## run this program
docker compose run henmiss --help
```

### NodeJs
```sh
## install dependencies
yarn intall

## build the package
yarn build

## run this program
yarn prod --help
```

## Usage
Get the secret key from the mnemonic
```sh
yarn prod key

```

Collect the Objkt
```sh
yarn prod collect
```
