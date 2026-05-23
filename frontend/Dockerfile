# Stage 1: Build production bundle
FROM node:22-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

# Install packages
RUN npm install

COPY . .

# Build the app to dist/ folder
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine AS production-stage

# Copy compiled assets from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
