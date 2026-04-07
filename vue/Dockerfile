# AS 이름 지어주기
FROM node:24.12.0-slim AS builder
WORKDIR /app

#도커 컴포즈로 받기
ARG VITE_BACKEND_URL

#환경 변수
#ENV VITE_BACKEND_URL=http://localhost:8080
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# 필요한 파일 복사 (라이브러리 다운)
COPY package.json ./

RUN npm install

#현재 안에 있는 파일 전부를 넣기
COPY ./ ./
# 컨테니어 안에 jar 파일이 생성이 될거임
RUN npm run build


#실행 단계
FROM nginx:latest
COPY --from=builder /app/dist	 /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]