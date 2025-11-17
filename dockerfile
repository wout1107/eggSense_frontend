FROM node:20-bullseye

ENV EXPO_NO_INTERACTIVE=1 \
    TERM=xterm-256color

WORKDIR /app

# cache layer
COPY package*.json ./
RUN npm install

# app code
COPY . .

# Ports:
# 19000: bundler (Expo Go), 19001: WS, 19002: DevTools, 19006: Web
EXPOSE 19000 19001 19002 19006

# Run web (and LAN) so it’s reachable from host
# If LAN causes issues, switch to: ["npm","run","start:web"]
CMD ["npm","run","start:web:lan"]