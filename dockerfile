FROM node:20-bullseye

ENV EXPO_NO_INTERACTIVE=1 \
    TERM=xterm-256color

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy app code
COPY . .

# Expose port for Expo web
EXPOSE 8081

# Start Expo web server using npm script
CMD ["npm", "run", "web"]
