# Node.js 베이스 이미지 사용 (Debian 기반)
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필수 패키지 업데이트 및 curl 설치
RUN apt-get update && apt-get install -y curl

# 종속성 파일 복사
COPY package*.json yarn.lock ./

# 종속성 설치
RUN yarn install --force

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3001

# 애플리케이션 실행
CMD ["yarn", "start:dev"]
