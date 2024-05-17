FROM node:20-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-cjk

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENTRYPOINT ["/app/bin/index.js"]
