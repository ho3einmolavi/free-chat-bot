FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.ir
RUN npm install --omit=dev

COPY . .

# Create data directory
RUN mkdir -p data

EXPOSE 3001

CMD ["node", "index.js"]

