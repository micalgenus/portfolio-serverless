# portfolio-serverless

[![TravisCI](https://travis-ci.org/micalgenus/portfolio-serverless.svg?branch=develop)](https://travis-ci.org/micalgenus/portfolio-serverless)
[![Maintainability](https://api.codeclimate.com/v1/badges/b3e8b5928b4e461ca3a1/maintainability)](https://codeclimate.com/github/micalgenus/portfolio-serverless/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b3e8b5928b4e461ca3a1/test_coverage)](https://codeclimate.com/github/micalgenus/portfolio-serverless/test_coverage)

포트폴리오 제공용 홈페이지의 serverless GraphQL 서비스입니다. Google Cloud Functions, Google Cloud Datastore를 사용합니다.

## 사용법

```
$ yarn build && yarn deploy:gcp
```

### 필수 사항

#### .env

```
GOOGLE_DATASTORE_PROJECT_ID=<project-id>

REDIS_HOST=<redis-host>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-password>
```

GOOGLE_DATASTORE_PROJECT_ID: 배포하고자 하는 Cloud Functions와 같은 프로젝트에 존재하는 Cloud Datastore이여야 합니다.

#### GCP key

해당 프로젝트에 Google Cloud Platform의 key를 받아 keyfile.json을 프로젝트에 포함시킵니다.

#### RSA 인증서

JWT를 암호화 하기 위해서 RSA인증 방식을 사용하기 때문에, 인증서를 포함하여야 합니다. 아래 명령어를 사용하여 인증서를 만듭니다.

```
$ openssl genrsa -out private.pem 2048
```

로컬에서 배포하려면, 아래의 명령어를 사용해 public.pem을 만들어 줍니다.

```
$ openssl rsa -in private.pem -out public.pem -outform PEM -pubout
```

### 자동 배포

travis-ci를 사용하여 자동 배포를 진행하기 위해서는 `.env`, `keyfile.json`, `private.pem`파일을 `travis-secret.tar`로 묶은 후, traivs-cli의 encrypt-file을 사용하여 `travis-secret.tar.enc`로 만듭니다.

```
$ tar cf travis-secret.tar .env keyfile.json private.pem
$ travis encrypt-file travis-secret.tar --add
```