FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
