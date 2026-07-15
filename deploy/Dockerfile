# Build the web client, then serve the static bundle with nginx.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_DEFAULT_HOMESERVER=https://matrix.org
ENV VITE_DEFAULT_HOMESERVER=${VITE_DEFAULT_HOMESERVER}
RUN npm run build

FROM nginx:alpine
COPY deploy/nginx-web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
