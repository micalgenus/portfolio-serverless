# portfolio-serverless

[![TravisCI](https://travis-ci.org/micalgenus/portfolio-serverless.svg?branch=develop)](https://travis-ci.org/micalgenus/portfolio-serverless)

## 사용법
해당 프로젝트에 Google Cloud Platform의 key를 받아 keyfile.json을 프로젝트에 포함시킵니다.

### 자동 배포
travis-ci를 사용하여 자동 배포를 진행하기 위해서는 traivs-cli의 encrypt-file을 이용하여 keyfile.json을 암호화하여 추가합니다.