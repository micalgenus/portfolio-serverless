# portfolio-serverless

[![TravisCI](https://travis-ci.org/micalgenus/portfolio-serverless.svg?branch=develop)](https://travis-ci.org/micalgenus/portfolio-serverless)
[![Maintainability](https://api.codeclimate.com/v1/badges/b3e8b5928b4e461ca3a1/maintainability)](https://codeclimate.com/github/micalgenus/portfolio-serverless/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b3e8b5928b4e461ca3a1/test_coverage)](https://codeclimate.com/github/micalgenus/portfolio-serverless/test_coverage)

포트폴리오 제공용 홈페이지의 serverless GraphQL 서비스입니다. Google Cloud Functions, Google Cloud Datastore를 사용합니다.

## 사용법

```
yarn build && yarn deploy:gcp
```

### 필수 사항

#### .env

```
GOOGLE_DATASTORE_PROJECT_ID=<project-id>
```

GOOGLE_DATASTORE_PROJECT_ID: 배포하고자 하는 Cloud Functions와 같은 프로젝트에 존재하는 Cloud Datastore이여야 합니다.

#### GCP key

해당 프로젝트에 Google Cloud Platform의 key를 받아 keyfile.json을 프로젝트에 포함시킵니다.

### 자동 배포

travis-ci를 사용하여 자동 배포를 진행하기 위해서는 traivs-cli의 encrypt-file을 이용하여 keyfile.json을 암호화하여 추가합니다.
